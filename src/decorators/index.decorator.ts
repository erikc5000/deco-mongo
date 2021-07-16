import * as mongo from 'mongodb'
import {
    INDEXES_KEY,
    getIndexMetadata,
    IndexSpecificationEntry
} from '../internal/metadata/index.metadata'
import 'reflect-metadata'

/**
 * Define an index that should be associated with a collection.  By default, indexes will only be
 * created if a collection didn't exist previously, but this behavior can be modified via the
 * options provided to the \@Collection decorator.  The index specifications are provided directly
 * to Mongo, so they should be written in terms of the document as represented in the database --
 * no mapping is applied.
 * @param index A Mongo index specification
 */
export function Index(index: mongo.IndexSpecification, options: mongo.CreateIndexesOptions = {}) {
    return (target: any) => {
        defineIndex(target, { type: 'single', index, options })
    }
}

/**
 * Define indexes that should be associated with a collection.  By default, indexes will only be
 * created if a collection didn't exist previously, but this behavior can be modified via the
 * options provided to the \@Collection decorator.  The index specifications are provided directly
 * to Mongo, so they should be written in terms of the document as represented in the database --
 * no mapping is applied.
 * @param indexes A list of Mongo index specifications
 */
export function Indexes(
    indexes: mongo.IndexDescription[],
    options: mongo.CreateIndexesOptions = {}
) {
    return (target: any) => {
        if (indexes.length > 0) {
            defineIndex(target, { type: 'many', index: indexes, options })
        }
    }
}

function defineIndex(target: any, newIndexEntry: IndexSpecificationEntry) {
    const existingIndexes = getIndexMetadata(target)

    Reflect.defineMetadata(
        INDEXES_KEY,
        existingIndexes ? [...existingIndexes, newIndexEntry] : [newIndexEntry],
        target
    )
}
