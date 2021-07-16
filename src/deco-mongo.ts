import * as mongo from 'mongodb'
import { ClassType, CollectionOptions } from './interfaces'
import { getCollectionMetadata } from './internal/metadata/collection.metadata'
import { collectionExists, isIndexOptionsConflictError } from './internal/mongo-util'
import { getIndexMetadata } from './internal/metadata/index.metadata'
import { Console } from 'console'

export class DecoMongo {
    static async initializeCollection<T extends object>(classType: ClassType<T>, db: mongo.Db) {
        const collectionMetadata = getCollectionMetadata(classType)

        if (!collectionMetadata) {
            throw new Error(`${classType.name} has no @Collection() decorator`)
        }

        const { name, options } = collectionMetadata
        const collExists = await collectionExists(name, db)
        let collection: mongo.Collection

        if (collExists) {
            collection = db.collection(name)

            if (options?.jsonSchema?.when === 'always') {
                const validator = options.jsonSchema.use
                    ? { $jsonSchema: options.jsonSchema.use }
                    : {}
                await db.command({ collMod: name, validator })
            }
        } else {
            const createOptions = DecoMongo.getCollectionCreateOptions(options)
            collection = await db.createCollection(name, createOptions)
        }

        if (
            options &&
            (options.autoCreateIndexes === 'always' ||
                (!collExists && options.autoCreateIndexes === 'ifNewCollection'))
        ) {
            await DecoMongo.createIndexes(classType, collection)
        }

        return collection
    }

    private static getCollectionCreateOptions(options: CollectionOptions = {}) {
        const createOptions: mongo.CreateCollectionOptions = options.mongoCreateOptions || {}

        if (options.jsonSchema && options.jsonSchema.when !== 'never' && options.jsonSchema.use) {
            createOptions.validator = { $jsonSchema: options.jsonSchema.use }
        }

        return createOptions
    }

    private static async createIndexes<TDocument extends object>(
        classType: ClassType<TDocument>,
        collection: mongo.Collection
    ) {
        const indexesMetadata = getIndexMetadata(classType)

        for (const indexEntry of indexesMetadata) {
            const { type, index, options } = indexEntry

            try {
                if (type === 'single') {
                    await collection.createIndex(index as mongo.IndexSpecification, options)
                } else {
                    await collection.createIndexes(index as mongo.IndexDescription[], options)
                }
            } catch (err) {
                if (isIndexOptionsConflictError(err)) {
                    // TODO: Revisit logging
                    // Logger.warn(err.errmsg);
                }
                // tslint:disable-next-line: no-console
                console.warn(err)
            }
        }
    }
}
