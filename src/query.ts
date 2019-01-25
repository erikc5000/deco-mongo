import * as mongo from 'mongodb'
import { Mapper } from './mapper'
import { MappedCollection } from './mapped-collection'

/**
 * Base class for all queries
 */
export abstract class Query<T extends object> {
    /** @internal */
    async _find(collection: MappedCollection<T>): Promise<T[]> {
        const filter = this.getFilter(collection.mapper)
        const options = this.getOptions()
        const cursor = collection.unmapped.find(filter, options)
        return await this.getResults(cursor, collection.mapper)
    }

    /** @internal */
    async _findOne(collection: MappedCollection<T>): Promise<T | undefined> {
        const filter = this.getFilter(collection.mapper)
        const options = this.getOptions() || {}

        // Override any existing limit
        options.limit = 1

        const cursor = collection.unmapped.find(filter, options)
        const results = await this.getResults(cursor, collection.mapper)
        return results.length > 0 ? results[0] : undefined
    }

    protected abstract getFilter(mapper: Mapper<T>): mongo.FilterQuery<any>

    protected getOptions(): mongo.FindOneOptions | undefined {
        return undefined
    }

    protected async getResults(cursor: mongo.Cursor<any>, mapper: Mapper<T>): Promise<T[]> {
        return await cursor.map(document => mapper.mapFromResult(document)).toArray()
    }
}
