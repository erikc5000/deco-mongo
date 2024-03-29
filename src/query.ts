import * as mongo from 'mongodb'
import { Mapper } from './mapper'
import { MappedCollection } from './mapped-collection'
import { KeyOf } from './interfaces'

/**
 * Base class for all queries
 */
export abstract class Query<T extends object> {
    /** @internal */
    async _find(collection: MappedCollection<T>): Promise<T[]> {
        const filter = this.getFilter(collection.mapper)
        const options = this.getOptions(collection.mapper)
        const cursor = collection.unmapped.find(filter, options)
        return await this.getResults(cursor, collection.mapper)
    }

    /** @internal */
    async _findOne(collection: MappedCollection<T>): Promise<T | undefined> {
        const filter = this.getFilter(collection.mapper)
        const options = this.getOptions(collection.mapper) || {}

        // Override any existing limit
        options.limit = 1

        const cursor = collection.unmapped.find(filter, options)
        const results = await this.getResults(cursor, collection.mapper)
        return results.length > 0 ? results[0] : undefined
    }

    protected abstract getFilter(mapper: Mapper<T>): mongo.Filter<any>

    protected getOptions(mapper: Mapper<T>): mongo.FindOptions<any> | undefined {
        return undefined
    }

    protected async getResults(cursor: mongo.FindCursor<any>, mapper: Mapper<T>): Promise<T[]> {
        return await cursor.map(document => mapper.mapFromResult(document)).toArray()
    }
}

/** Sort helper options */
export interface SortHelperOptions {
    /** Ignore duplicated properties or throw an exception? */
    duplicatePolicy?: 'ignore' | 'throw'
}

/** A class that helps with implementing a `sortBy()` builder method on queries. */
export class SortHelper<T extends object> {
    private sortItems = new Map<KeyOf<T>, mongo.SortDirection>()

    constructor(private readonly options: SortHelperOptions = {}) {}

    /**
     * Add a sort specification for a particular property
     * @param property The property to sort by
     * @param order Sort order
     */
    push(property: KeyOf<T>, order: mongo.SortDirection) {
        if (!this.sortItems.has(property)) {
            this.sortItems.set(property, order)
        } else if (this.options.duplicatePolicy === 'throw') {
            throw new Error(`Already sorting by ${property}`)
        }
    }

    /**
     * Get the sort option that should be provided to the MongoDB driver
     * @param mapper A mapper object
     */
    getSortOption(mapper: Mapper<T>): mongo.Sort {
        const mappedSortItems = new Map<string, mongo.SortDirection>()

        for (const [key, value] of this.sortItems.entries()) {
            mappedSortItems.set(mapper.mapPropertyNameToDb(key), value)
        }

        return mappedSortItems
    }
}
