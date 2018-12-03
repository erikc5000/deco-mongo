import * as mongo from 'mongodb'
import { collectionExists } from './mongo-util'
import { getCollectionMetadata } from './metadata/collection-metadata'
import { getIndexesMetadata } from './metadata/indexes-metadata'
import { ClassType } from './interfaces'
import { mapObjectToDatabase } from './mapper'

function processJsonSchemaOption(jsonSchemaOption?: boolean | object) {
    if (typeof jsonSchemaOption === 'boolean' && jsonSchemaOption) {
        // generateJsonSchema()
    } else if (typeof jsonSchemaOption === 'object') {
        return jsonSchemaOption
    }

    return undefined
}

export class Model<TInterface, TDocument extends object> {
    constructor(
        private readonly classType: ClassType<TDocument>,
        private readonly collection: mongo.Collection
    ) {}

    static async create<TInterface, TDocument extends object>(
        classType: ClassType<TDocument>,
        db: mongo.Db
    ) {
        const { name, options } = getCollectionMetadata(classType)
        const indexSpecs = getIndexesMetadata(classType)

        let createOptions: mongo.CollectionCreateOptions = {}
        let jsonSchema: object | undefined

        if (options) {
            if (options.mongoCreateOptions) createOptions = options.mongoCreateOptions

            jsonSchema = processJsonSchemaOption(options.jsonSchema)
        }

        if (jsonSchema) createOptions.validator = { $jsonSchema: jsonSchema }

        let collection: mongo.Collection
        const collExists = await collectionExists(name, db)

        if (collExists) {
            collection = db.collection(name)

            if (jsonSchema) {
                await db.command({
                    collMod: 'gyms',
                    validator: createOptions.validator
                })
            } else {
                await db.command({ collMod: 'gyms', validator: {} })
            }
        } else {
            collection = await db.createCollection(name, createOptions)
        }

        if (indexSpecs && indexSpecs.length > 0) {
            try {
                await collection.createIndexes(indexSpecs)
            } catch (err) {
                // IndexOptionsConflict
                if (err instanceof mongo.MongoError && err.code === 85) {
                    // TODO: Revisit logging
                    // Logger.warn(err.errmsg);
                }
            }
        }

        return new Model<TInterface, TDocument>(classType, collection)
    }

    async insertMany(objs: TInterface[], options?: mongo.CollectionInsertManyOptions) {
        return await this.collection.insertMany(objs, options)
    }

    async insertOne(obj: TInterface, options?: mongo.CollectionInsertOneOptions) {
        const mappedObject = mapObjectToDatabase(obj, this.classType)
        return await this.collection.insertOne(mappedObject, options)
    }
}
