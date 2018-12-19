import * as mongo from 'mongodb'
import { collectionExists, isIndexOptionsConflictError } from './mongo-util'
import { getCollectionMetadata } from './metadata/collection.metadata'
import { getIndexesMetadata } from './metadata/indexes.metadata'
import { ClassType, CollectionOptions } from './interfaces'
import { Mapper, MapForUpdateOptions, UpdateOperation } from './mapper'

export class Model<TInterface, TDocument extends object> {
    private readonly mapper: Mapper<TInterface, TDocument>

    constructor(
        private readonly classType: ClassType<TDocument>,
        readonly collection: mongo.Collection
    ) {
        this.mapper = new Mapper(classType)
    }

    static async create<TInterface, TDocument extends object>(
        classType: ClassType<TDocument>,
        db: mongo.Db
    ) {
        const { name, options } = getCollectionMetadata(classType)
        const collExists = await collectionExists(name, db)
        let collection: mongo.Collection

        if (collExists) {
            collection = db.collection(name)

            if (options && options.jsonSchema && options.jsonSchema.autoApply === 'always') {
                const validator = options.jsonSchema.use
                    ? { $jsonSchema: options.jsonSchema.use }
                    : {}
                await db.command({ collMod: name, validator })
            }
        } else {
            const createOptions = Model.getCollectionCreateOptions(options)
            collection = await db.createCollection(name, createOptions)
        }

        if (
            options &&
            (options.autoCreateIndexes === 'always' ||
                (!collExists && options.autoCreateIndexes === 'ifNewCollection'))
        ) {
            await Model.createIndexes(classType, collection)
        }

        return new Model<TInterface, TDocument>(classType, collection)
    }

    mapForInsert(document: TDocument): any
    mapForInsert(documents: TDocument[]): any[]
    mapForInsert(document: TDocument | TDocument[]): any {
        if (Array.isArray(document)) {
            return document.map(obj => this.mapper.mapForInsert(obj))
        } else if (document instanceof this.classType) {
            return this.mapper.mapForInsert(document)
        } else {
            return Model.unexpectedTypeError(document)
        }
    }

    mapForUpdate(document: TDocument, options?: MapForUpdateOptions): UpdateOperation
    mapForUpdate(documents: TDocument[], options?: MapForUpdateOptions): UpdateOperation[]
    mapForUpdate(document: TDocument | TDocument[], options?: MapForUpdateOptions): any {
        if (Array.isArray(document)) {
            return document.map(obj => this.mapper.mapForUpdate(obj), options)
        } else if (document instanceof this.classType) {
            return this.mapper.mapForUpdate(document, options)
        } else {
            return Model.unexpectedTypeError(document)
        }
    }

    mapFromResult(object: object | object[]): TDocument | TDocument[] {
        if (Array.isArray(object)) {
            return object.map(obj => this.mapper.mapFromResult(obj))
        } else if (typeof object === 'object') {
            return this.mapper.mapFromResult(object)
        } else {
            return Model.unexpectedTypeError(object)
        }
    }

    mapPartialToDb(object: Partial<TInterface>): any
    mapPartialToDb(objects: Partial<TInterface>[]): any[]
    mapPartialToDb(object: Partial<TInterface> | Partial<TInterface>[]): any {
        if (Array.isArray(object)) {
            return object.map(obj => this.mapper.mapPartialToDb(obj))
        } else if (typeof object === 'object') {
            return this.mapper.mapPartialToDb(object)
        } else {
            return Model.unexpectedTypeError(object)
        }
    }

    mapPartialFromDb(object: object | object[]): Partial<TInterface> | Partial<TInterface>[] {
        if (Array.isArray(object)) {
            return object.map(obj => this.mapper.mapPartialFromDb(obj))
        } else if (typeof object === 'object') {
            return this.mapper.mapPartialFromDb(object)
        } else {
            return Model.unexpectedTypeError(object)
        }
    }

    private static getCollectionCreateOptions(options?: CollectionOptions) {
        let createOptions: mongo.CollectionCreateOptions = {}

        if (options) {
            if (options.mongoCreateOptions) {
                createOptions = options.mongoCreateOptions
            }

            if (
                options.jsonSchema &&
                options.jsonSchema.autoApply !== 'never' &&
                options.jsonSchema.use
            ) {
                createOptions.validator = { $jsonSchema: options.jsonSchema.use }
            }
        }

        return createOptions
    }

    private static async createIndexes<TDocument extends object>(
        classType: ClassType<TDocument>,
        collection: mongo.Collection
    ) {
        const indexSpecs = getIndexesMetadata(classType)

        if (indexSpecs && indexSpecs.length > 0) {
            try {
                await collection.createIndexes(indexSpecs)
            } catch (err) {
                if (isIndexOptionsConflictError(err)) {
                    // TODO: Revisit logging
                    // Logger.warn(err.errmsg);
                }
            }
        }
    }

    private static unexpectedTypeError(object: any): never {
        throw new Error(`Mapping unexpected type '${typeof object}'`)
    }
}
