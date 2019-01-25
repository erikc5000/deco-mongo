import * as mongo from 'mongodb'
import { Mapper } from './mapper'
import { InsertionError, UpdateError } from './errors'

export type MongoDeleteOneOptions = mongo.CommonOptions & { bypassDocumentValidation?: boolean }

/**
 * Wraps the MongoDB Collection operations, providing a slightly higher level interface that
 * maps documents coming in and out.
 */
export class MappedCollection<T extends object> {
    constructor(readonly mapper: Mapper<T>, private readonly collection: mongo.Collection) {}

    /**
     * Access the underlying collection to perform unmapped operations
     */
    get unmapped() {
        return this.collection
    }

    /**
     * Map and insert a single document into the DB, returning the inserted document, which is
     * mapped back from DB represention.
     * @param document The document to insert
     * @param options MongoDB Collection.insertOne() options
     */
    async insertOne(document: T, options: mongo.CollectionInsertOneOptions = {}) {
        const mappedDoc = this.mapper.mapForInsert(document)
        const result = await this.collection.insertOne(mappedDoc, options)

        if (result.insertedCount !== 1 || result.ops.length < 1) {
            throw new InsertionError(result)
        }

        return this.mapper.mapFromResult(result.ops[0])
    }

    /**
     * Map and insert multiple documents into the DB, returning the inserted documents, which are
     * mapped back from DB represention.
     * @param documents The documents to insert
     * @param options MongoDB Collection.insertMany() options()
     */
    async insertMany(documents: T[], options: mongo.CollectionInsertManyOptions = {}) {
        const mappedDocs = this.mapper.mapForInsert(documents)
        const result = await this.collection.insertMany(mappedDocs, options)

        if (result.insertedCount !== documents.length || result.ops.length < documents.length) {
            throw new InsertionError(result)
        }

        return this.mapper.mapFromResults(result.ops)
    }

    /**
     * Find a document by MongoDB filter, perform an update operation that replaces the entire
     * content of the document (except for creation timestamps), and return the new document mapped
     * back from DB representation.
     * @param filter A MongoDB filter object
     * @param newContent The new document content
     * @param options Mongo options
     */
    async findOneAndUpdate(filter: any, newContent: T, options: mongo.FindOneAndUpdateOption = {}) {
        const update = this.mapper.mapForUpdate(newContent, { upsert: options.upsert })
        const result = await this.collection.findOneAndUpdate(filter, update, options)

        if (result.ok !== 1 || result.value == null) {
            throw new UpdateError(result)
        }

        return this.mapper.mapFromResult(result.value)
    }

    /**
     * Delete a single matching document.
     * @param filter A MongODB filter object
     * @returns `true` on success or `false` on failure
     */
    async deleteOne(filter: any, options?: MongoDeleteOneOptions) {
        const result = await this.collection.deleteOne(filter, options)
        return result.deletedCount === 1 ? true : false
    }

    /**
     * Delete all matching documents.
     * @param filter A MongODB filter object
     * @returns The number of documents removed
     */
    async deleteMany(filter: any, options?: MongoDeleteOneOptions) {
        const result = await this.collection.deleteMany(filter, options)
        return result.deletedCount || 0
    }

    /**
     * Find documents and return a cursor that maps the results back from DB representation.
     * @param filter A MongoDB filter object
     */
    find(filter?: any) {
        const cursor = this.collection.find(filter)
        return cursor.map(result => this.mapper.mapFromResult(result))
    }

    /**
     * Find documents and return a cursor that maps partial results back from DB representation.
     * This is intended for use when doing a projection to obtain a subset of a document's
     * properties.
     * @param filter A MongoDB filter object
     */
    findPartial(filter?: any) {
        const cursor = this.collection.find(filter)
        return cursor.map(result => this.mapper.mapPartialsFromDb(result))
    }

    /**
     * Find a single document and map it back from DB representation.
     * @param filter A MongoDB filter object
     * @param options Mongo options
     */
    async findOne(filter: any, options?: mongo.FindOneOptions) {
        const result = await this.collection.findOne(filter, options)

        if (result) {
            return this.mapper.mapFromResult(result)
        }
    }

    /**
     * Find a single document and return a subset of it mapped back from DB representation. This is
     * intended to be used when doing a projection.
     * @param filter A MongoDB filter object
     * @param options Mongo options
     */
    async findOnePartial(filter: any, options?: mongo.FindOneOptions) {
        const result = await this.collection.findOne(filter, options)

        if (result) {
            return this.mapper.mapPartialFromDb(result)
        }
    }

    getIdFilter(id: any) {
        return this.mapper.mapIdToDb(id)
    }
}
