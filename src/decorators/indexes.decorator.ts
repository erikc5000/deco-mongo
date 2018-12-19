import * as mongo from 'mongodb'
import { INDEXES_KEY, getIndexesMetadata } from '../metadata/indexes.metadata'
import 'reflect-metadata'

/**
 * Define indexes that should be associated with a collection.  By default, indexes will only be
 * created if a collection didn't exist previously, but this behavior can be modified via the
 * options provided to the \@Collection decorator.  The index specifications are provided directly
 * to Mongo, so they should be written in terms of the document as represented in the database --
 * no mapping is applied.
 * @param indexes A list of Mongo index specifications
 */
export function Indexes(...indexes: mongo.IndexSpecification[]) {
    return (target: any) => {
        if (indexes.length > 0) {
            const existingIndexes = getIndexesMetadata(target)

            if (!existingIndexes) {
                Reflect.defineMetadata(INDEXES_KEY, indexes, target)
            } else {
                Reflect.defineMetadata(INDEXES_KEY, [...existingIndexes, ...indexes], target)
            }
        }
    }
}
