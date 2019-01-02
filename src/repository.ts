import * as mongo from 'mongodb'
import { collectionExists, isIndexOptionsConflictError } from './internal/mongo-util'
import { getCollectionMetadata } from './internal/metadata/collection.metadata'
import { getIndexesMetadata } from './internal/metadata/indexes.metadata'
import { ClassType, CollectionOptions } from './interfaces'
import { Mapper } from './mapper'

export class Repository<T extends object> {
    readonly mapper: Mapper<T>

    constructor(classType: ClassType<T>, readonly collection: mongo.Collection) {
        this.mapper = new Mapper(classType)
    }

    static async create<T extends object>(classType: ClassType<T>, db: mongo.Db) {
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
            const createOptions = Repository.getCollectionCreateOptions(options)
            collection = await db.createCollection(name, createOptions)
        }

        if (
            options &&
            (options.autoCreateIndexes === 'always' ||
                (!collExists && options.autoCreateIndexes === 'ifNewCollection'))
        ) {
            await Repository.createIndexes(classType, collection)
        }

        return new Repository<T>(classType, collection)
    }

    private static getCollectionCreateOptions(options?: CollectionOptions) {
        let createOptions: mongo.CollectionCreateOptions = {}

        if (options) {
            if (options.mongoCreateOptions) {
                createOptions = options.mongoCreateOptions
            }

            if (
                options.jsonSchema &&
                options.jsonSchema.when !== 'never' &&
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
}
