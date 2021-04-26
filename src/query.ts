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
        const cursor =
            options != null
                ? collection.unmapped.find(filter, options)
                : collection.unmapped.find(filter)
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

    protected abstract getFilter(mapper: Mapper<T>): mongo.FilterQuery<any>

    protected getOptions(mapper: Mapper<T>): mongo.FindOneOptions<any> | undefined {
        return undefined
    }

    protected async getResults(cursor: mongo.Cursor<any>, mapper: Mapper<T>): Promise<T[]> {
        return await cursor.map(document => mapper.mapFromResult(document)).toArray()
    }
}

/** Sort order */
export const enum SortOrder {
    Ascending = 1,
    Descending = -1
}

/** Sort helper options */
export interface SortHelperOptions {
    /** Ignore duplicated properties or throw an exception? */
    duplicatePolicy?: 'ignore' | 'throw'
}

interface SortItem<T extends object> {
    property: KeyOf<T>
    order: SortOrder
}

type SortArrayTuple = [string, number]

/** A class that helps with implementing a `sortBy()` builder method on queries. */
export class SortHelper<T extends object> {
    private sortItems: SortItem<T>[] = []

    constructor(private readonly options: SortHelperOptions = {}) {}

    /**
     * Add a sort specification for a particular property
     * @param property The property to sort by
     * @param order Sort order
     */
    push(property: KeyOf<T>, order: SortOrder) {
        if (!this.sortItems.some(item => item.property === property)) {
            this.sortItems.push({ property, order })
        } else if (this.options.duplicatePolicy === 'throw') {
            throw new Error(`Already sorting by ${property}`)
        }
    }

    /**
     * Get the sort option that should be provided to the MongoDB driver
     * @param mapper A mapper object
     */
    getSortOption(mapper: Mapper<T>) {
        return this.sortItems.map(item => SortHelper.createSortArrayTuple(item, mapper))
    }

    private static createSortArrayTuple<T extends object>(
        item: SortItem<T>,
        mapper: Mapper<T>
    ): SortArrayTuple {
        return [mapper.mapPropertyNameToDb(item.property), item.order]
    }
}
