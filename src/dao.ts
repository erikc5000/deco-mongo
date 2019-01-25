import * as mongo from 'mongodb'
import { ClassType } from './interfaces'
import { MappedCollection } from './mapped-collection'
import { Mapper } from './mapper'
import { Query } from './query'

/** Replace options. */
export interface ReplaceOptions {
    /** If `true` and a matching document doesn't exist, it will be inserted. */
    upsert?: boolean
}

/**
 * Data access object.  Provides high-level access to a MongoDB collection, enabling operations
 * to be performed on domain layer data structures.  This class is intended to be sub-classed or
 * re-implemented as necessary to fit your specific needs.  It may also be wrapped by a custom
 * repository class.
 */
export class Dao<TDoc extends object, TId = any> {
    protected readonly collection: MappedCollection<TDoc>

    constructor(classType: ClassType<TDoc>, collection: mongo.Collection) {
        this.collection = new MappedCollection(new Mapper(classType), collection)
    }

    /**
     * Insert a document into the persistance layer
     * @param document The document to insert
     * @returns The inserted document
     */
    async insert(document: TDoc): Promise<TDoc>

    /**
     * Insert documents into the persistence layer
     * @param documents The documents to insert
     * @returns The inserted documents
     */
    async insert(documents: TDoc[]): Promise<TDoc[]>

    async insert(document: TDoc | TDoc[]): Promise<TDoc | TDoc[]> {
        if (Array.isArray(document)) {
            return await this.collection.insertMany(document)
        }

        return await this.collection.insertOne(document)
    }

    /**
     * Replace an existing document
     * @param id The ID of the document to replace
     * @param newContent The new content of the document
     * @param options Options
     * @returns The updated document
     */
    async replace(id: TId, newContent: TDoc, options: ReplaceOptions = {}) {
        const filter = this.collection.getIdFilter(id)

        return await this.collection.findOneAndUpdate(filter, newContent, {
            upsert: options.upsert,
            returnOriginal: false
        })
    }

    /**
     * Delete a document by its ID
     * @param id The ID of the document to delete
     * @returns `true` on success or `false` on failure
     */
    async delete(id: TId) {
        const filter = this.collection.getIdFilter(id)
        return await this.collection.deleteOne(filter)
    }

    /**
     * Find matching documents
     * @param query A query specification
     * @returns An array of matching documents
     */
    async find(query: Query<TDoc>) {
        return await query._find(this.collection)
    }

    /**
     * Find the first matching document
     * @param query A query specification
     * @returns
     */
    async findOne(query: Query<TDoc>) {
        return await query._findOne(this.collection)
    }

    /**
     * Find a document by its ID
     * @param id The ID of the document
     */
    async findById(id: TId) {
        const filter = this.collection.getIdFilter(id)
        return await this.collection.findOne(filter)
    }
}
