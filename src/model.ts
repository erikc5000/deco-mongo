import * as mongo from 'mongodb'
import { collectionExists } from './mongo-util'
import { getCollectionMetadata } from './metadata/collection-metadata'
import { getIndexesMetadata } from './metadata/indexes-metadata'
import { ClassType } from './interfaces'
import { Mapper, MapToDbOptions } from './mapper'

function processJsonSchemaOption(jsonSchemaOption?: boolean | object) {
    if (typeof jsonSchemaOption === 'boolean' && jsonSchemaOption) {
        // generateJsonSchema()
    } else if (typeof jsonSchemaOption === 'object') {
        return jsonSchemaOption
    }

    return undefined
}

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
        const mappedObjects = this.mapToDb(objs, { timestamps: 'create' })
        const result = await this.collection.insertMany(mappedObjects, options)

        if (result.ops.length) {
            return this.mapFromDb(result.ops)
        }
    }

    async insertOne(obj: TInterface, options?: mongo.CollectionInsertOneOptions) {
        const mappedObject = this.mapToDb(obj, { timestamps: 'create' })
        const result = await this.collection.insertOne(mappedObject, options)

        if (result.ops.length) {
            return this.mapFromDb(result.ops[0])
        }
    }

    mapToDb(obj: any, options?: MapToDbOptions): any {
        if (Array.isArray(obj)) {
            return this.mapper.mapObjectsToDb(obj, options)
        } else if (typeof obj === 'object') {
            return this.mapper.mapObjectToDb(obj, options)
        } else {
            throw new Error(`Mapping unexpected type '${typeof obj}'`)
        }
    }

    mapFromDb(obj: any): Partial<TInterface> | Partial<TInterface>[] {
        if (Array.isArray(obj)) {
            return this.mapper.mapObjectsFromDb(obj)
        } else if (typeof obj === 'object') {
            return this.mapper.mapObjectFromDb(obj)
        } else {
            throw new Error(`Mapping unexpected type '${typeof obj}'`)
        }
    }
}
