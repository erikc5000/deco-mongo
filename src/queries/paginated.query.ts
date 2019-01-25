import * as mongo from 'mongodb'
import { Query } from '../query'

export interface PaginatedQueryOptions {
    skip?: number
    limit?: number
}

/**
 * A query with skip and limit functions to support pagination.
 */
export abstract class PaginatedQuery<T extends object> extends Query<T> {
    private readonly paginationOptions: PaginatedQueryOptions = {}

    constructor() {
        super()
    }

    /**
     * Skip over a certain number of results
     * @param skip The number of results to skip over
     */
    skip(skip: number) {
        this.paginationOptions.skip = skip
        return this
    }

    /**
     * Set an upper limit on the number of results returned
     * @param limit Maximum number of results to include
     */
    limit(limit: number) {
        this.paginationOptions.limit = limit
        return this
    }

    /**
     * Provide pagination options to Mongo
     */
    protected getOptions(): mongo.FindOneOptions | undefined {
        return this.paginationOptions
    }
}
