import * as mongo from 'mongodb';
import { collectionExists } from './mongo-util';
import { getCollectionMetadata } from './metadata/collection-metadata';
import { getIndexesMetadata } from './metadata/indexes-metadata';
import { ClassType } from './interfaces';

function processJsonSchemaOption(jsonSchemaOption?: boolean | object) {
    if (typeof jsonSchemaOption === 'boolean' && jsonSchemaOption) {
        // generateJsonSchema()
    } else if (typeof jsonSchemaOption === 'object') {
        return jsonSchemaOption;
    }

    return undefined;
}

export class Model<TInterface, TDocument extends object> {
    constructor(private readonly collection: mongo.Collection) { }

    static async create<TInterface, TDocument extends object>(
        c: ClassType<TDocument>,
        db: mongo.Db,
    ) {
        const { name, options } = getCollectionMetadata(c);
        const indexSpecs = getIndexesMetadata(c);

        let createOptions: mongo.CollectionCreateOptions = {};
        let jsonSchema: object | undefined;

        if (options) {
            if (options.mongoCreateOptions)
                createOptions = options.mongoCreateOptions;

            jsonSchema = processJsonSchemaOption(options.jsonSchema);
        }

        if (jsonSchema)
            createOptions.validator = { $jsonSchema: jsonSchema };

        let collection: mongo.Collection;
        const collExists = await collectionExists(name, db);

        if (collExists) {
            collection = db.collection(name);

            if (jsonSchema) {
                await db.command({ collMod: 'gyms', validator: createOptions.validator });
            } else {
                await db.command({ collMod: 'gyms', validator: {} });
            }
        } else {
            collection = await db.createCollection(name, createOptions);
        }

        if (indexSpecs) {
            try {
                await collection.createIndexes(indexSpecs);
            } catch (err) {
                // IndexOptionsConflict
                if (err instanceof mongo.MongoError && err.code === 85) {
                    // TODO: Revisit logging
                    // Logger.warn(err.errmsg);
                }
            }
        }

        return new Model<TInterface, TDocument>(collection);
    }

    async insertOne(obj: TInterface) {
        return await this.collection.insertOne(obj);
    }
}

// const gymModel = await Model.create(GymDocumentNew, db);
