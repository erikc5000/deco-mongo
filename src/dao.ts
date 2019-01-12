import * as mongo from 'mongodb'
import { ClassType, CollectionOptions } from './interfaces'
import { MappedCollection } from './mapped-collection'
import { Mapper } from './mapper'
import { getIndexesMetadata } from './internal/metadata/indexes.metadata'
import { isIndexOptionsConflictError, collectionExists } from './internal/mongo-util'
import { getCollectionMetadata } from './internal/metadata/collection.metadata'
import { DaoFactory } from './internal/dao-factory'

export interface ReplaceOptions {
    upsert?: boolean
}

export class Dao<T extends object> {
    protected readonly collection: MappedCollection<T>

    constructor(classType: ClassType<T>, collection: mongo.Collection) {
        this.collection = new MappedCollection(new Mapper(classType), collection)
    }

    static async forDatabase<T extends object>(classType: ClassType<T>, db: mongo.Db) {
        const { name, options } = getCollectionMetadata(classType)
        const collExists = await collectionExists(name, db)
        let collection: mongo.Collection

        if (collExists) {
            collection = db.collection(name)

            if (options && options.jsonSchema && options.jsonSchema.when === 'always') {
                const validator = options.jsonSchema.use
                    ? { $jsonSchema: options.jsonSchema.use }
                    : {}
                await db.command({ collMod: name, validator })
            }
        } else {
            const createOptions = Dao.getCollectionCreateOptions(options)
            collection = await db.createCollection(name, createOptions)
        }

        if (
            options &&
            (options.autoCreateIndexes === 'always' ||
                (!collExists && options.autoCreateIndexes === 'ifNewCollection'))
        ) {
            await Dao.createIndexes(classType, collection)
        }

        return DaoFactory.create(classType, collection)
    }

    private static getCollectionCreateOptions(options: CollectionOptions = {}) {
        const createOptions: mongo.CollectionCreateOptions = options.mongoCreateOptions || {}

        if (options.jsonSchema && options.jsonSchema.when !== 'never' && options.jsonSchema.use) {
            createOptions.validator = { $jsonSchema: options.jsonSchema.use }
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

    async insert(document: T): Promise<T>
    async insert(documents: T[]): Promise<T[]>
    async insert(document: T | T[]): Promise<T | T[]> {
        if (Array.isArray(document)) {
            return await this.collection.insertMany(document)
        }

        return await this.collection.insertOne(document)
    }

    async replace(id: any, newContent: T, options: ReplaceOptions = {}): Promise<T> {
        return await this.collection.findByIdAndUpdate(id, newContent, {
            upsert: options.upsert,
            returnOriginal: false
        })
    }

    async delete(id: any): Promise<void> {
        return await this.collection.deleteById(id)
    }

    async findById(id: any) {
        return await this.collection.findById(id)
    }
}
