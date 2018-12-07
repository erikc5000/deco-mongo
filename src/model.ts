import * as mongo from 'mongodb'
import { collectionExists } from './mongo-util'
import { getCollectionMetadata } from './metadata/collection-metadata'
import { getIndexesMetadata } from './metadata/indexes-metadata'
import { ClassType } from './interfaces'
import {
    mapObjectToDatabase,
    mapObjectsToDatabase,
    mapObjectFromDatabase,
    mapObjectsFromDatabase,
    Mapper
} from './mapper'

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
        readonly collection: mongo.Collection
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
        const mappedObjects = mapObjectsToDatabase(objs, this.classType)
        const result = await this.collection.insertMany(mappedObjects, options)

        return result
    }

    async insertOne(obj: TInterface, options?: mongo.CollectionInsertOneOptions) {
        const mappedObject = this.map(obj).withCreationTimestamps().toDb
        const result = await this.collection.insertOne(mappedObject, options)

        if (result.ops.length) {
            return mapObjectFromDatabase(result.ops[0], this.classType)
        }

        else return undefined
    }

    map(obj: any) {
        return new Mapper(obj, this.classType)
    }

    // toDb(obj: Partial<TInterface>): any {
    //     return mapObjectToDatabase(obj, this.classType)
    // }

    // manyToDb(objects: Partial<TInterface>[]): any[] {
    //     return mapObjectsToDatabase(objects, this.classType)
    // }

    // fromDb(obj: any): Partial<TInterface> {
    //     return mapObjectFromDatabase(obj, this.classType)
    // }

    // manyFromDb(objects: any[]): Partial<TInterface>[] {
    //     return mapObjectsFromDatabase(objects, this.classType)
    // }
}
