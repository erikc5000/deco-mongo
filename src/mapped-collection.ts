import * as mongo from 'mongodb'
import { GeoJsonPoint, GeoJsonGeometry, GeoJsonPolygon, GeoJsonMultiPolygon } from './interfaces'
import { Mapper } from './mapper'
import { InsertionError, UpdateError } from './errors'

export type MongoDeleteOneOptions = mongo.CommonOptions & { bypassDocumentValidation?: boolean }

export interface FindNearOptions {
    minDistance?: number
    maxDistance?: number
}

export type GeospatialQueryOperator = '$near' | '$nearSphere' | '$geoWithin' | '$geoIntersects'

// export interface GeospatialQuery {
//     $near?: { $geometry: GeoJsonPoint }
//     $nearSphere?: { $geometry: GeoJsonPoint }
//     $geoWithin?: { $geometry: GeoJsonPolygon | GeoJsonMultiPolygon }
//     $geoIntersects?: { $geometry: GeoJsonPolygon | GeoJsonMultiPolygon }
//     [key: string]: { $geometry: GeoJsonPoint | GeoJsonPolygon | GeoJsonMultiPolygon } | undefined
// }

export interface GeospatialSearchOptions {
    minDistance?: number
    maxDistance?: number
}

/**
 * Wraps the MongoDB Collection operations, providing a slightly higher level interface that
 * maps documents coming in and out.
 */
export class MappedCollection<T extends object> {
    constructor(
        private readonly mapper: Mapper<T>,
        private readonly collection: mongo.Collection
    ) {}

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
     * Find a document by ID, perform an update operation that replaces the entire
     * content of the document (except for creation timestamps), and return the new document mapped
     * back from DB representation.
     * @param id The unmapped ID value
     * @param newContent The new document content
     * @param options Mongo options
     */
    async findByIdAndUpdate(id: any, newContent: T, options?: mongo.FindOneAndUpdateOption) {
        return await this.findOneAndUpdate(this.getIdFilter(id), newContent, options)
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
     * Delete a document by ID.  Returns `true` on success or `false` on failure.
     * @param id The unmapped ID value
     */
    async deleteById(id: any, options?: MongoDeleteOneOptions) {
        return await this.deleteOne(this.getIdFilter(id), options)
    }

    /**
     * Delete a document.  Returns `true` on success or `false` on failure.
     * @param filter A MongODB filter object
     */
    async deleteOne(filter: any, options?: MongoDeleteOneOptions) {
        const result = await this.collection.deleteOne(filter, options)
        return result.deletedCount === 1 ? true : false
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
     * Find a single document by ID and map it back from DB representation.
     * @param id An unmapped ID value
     * @param options Mongo options
     */
    async findById(id: any, options?: mongo.FindOneOptions) {
        return await this.findOne(this.getIdFilter(id), options)
    }

    /**
     * Find a a subset of a single document by ID and map it back from DB representation. This is
     * intended to be used when doing a projection.
     * @param id The unmapped ID value
     * @param options Mongo options
     */
    async findPartialById(id: any, options?: mongo.FindOneOptions) {
        return await this.findOnePartial(this.getIdFilter(id), options)
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

    /**
     * Find documents near a geographical location
     * @param locationProperty The unmapped location property name
     * @param geometry The GeoJSON point to search near
     * @param options Options
     */
    findNear<K extends Extract<keyof T, string>>(
        locationProperty: K,
        geometry: GeoJsonPoint,
        options: FindNearOptions = {}
    ) {
        return this.performGeospatialSearch(locationProperty, '$near', geometry, options)
    }

    /**
     * Find documents near a geographical location, forcing the use of spherical geometry for
     * 2d indexes.
     * @param locationProperty The unmapped location property name
     * @param geometry The GeoJSON point to search near
     * @param options Options
     */
    findNearSphere<K extends Extract<keyof T, string>>(
        locationProperty: K,
        geometry: GeoJsonPoint,
        options: FindNearOptions = {}
    ) {
        return this.performGeospatialSearch(locationProperty, '$nearSphere', geometry, options)
    }

    /**
     * Find documents with a location property that sits within a provided geographical area.
     * @param locationProperty The unmapped location property name
     * @param geometry The GeoJSON polygon or multi-polygon to search within
     * @param options Options
     */
    findWithin<K extends Extract<keyof T, string>>(
        locationProperty: K,
        geometry: GeoJsonPolygon | GeoJsonMultiPolygon
    ) {
        return this.performGeospatialSearch(locationProperty, '$geoWithin', geometry)
    }

    getIdFilter(id: any) {
        return this.mapper.mapIdToDb(id)
    }

    protected performGeospatialSearch<K extends Extract<keyof T, string>>(
        locationProperty: K,
        operator: GeospatialQueryOperator,
        geometry: GeoJsonGeometry,
        options?: GeospatialSearchOptions
    ) {
        const mappedProperty = this.mapper.mapPropertyNameToDb(locationProperty)

        const filter = MappedCollection.getGeospatialFilter(
            mappedProperty,
            operator,
            geometry,
            options
        )

        return this.find(filter)
    }

    static getGeospatialFilter(
        mappedProperty: string,
        operator: GeospatialQueryOperator,
        geometry: GeoJsonGeometry,
        options: GeospatialSearchOptions = {}
    ) {
        const filter: any = {}
        filter[mappedProperty] = {}
        filter[mappedProperty][operator] = { $geometry: geometry }

        if (operator === '$near' || operator === '$nearSphere') {
            if (options.minDistance != null) {
                filter[mappedProperty][operator].$minDistance = options.minDistance
            }

            if (options.maxDistance != null) {
                filter[mappedProperty][operator].$maxDistance = options.maxDistance
            }
        }

        return filter
    }
}
