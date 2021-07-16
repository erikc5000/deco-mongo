import { ClassType } from '../../interfaces'
import * as mongo from 'mongodb'

export const INDEXES_KEY = Symbol('decoMongo:indexes')

export type IndexSpecificationEntry = {
    type: 'single' | 'many'
    index: mongo.IndexDescription[] | mongo.IndexSpecification
    options: mongo.CreateIndexesOptions
}

export function getIndexMetadata<T extends object>(
    classType: ClassType<T>
): IndexSpecificationEntry[] {
    return Reflect.hasOwnMetadata(INDEXES_KEY, classType)
        ? Reflect.getOwnMetadata(INDEXES_KEY, classType)
        : []
}
