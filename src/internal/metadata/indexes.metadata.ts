import { ClassType } from '../../interfaces'
import * as mongo from 'mongodb'

export const INDEXES_KEY = Symbol('decoMongo:indexes')

export function getIndexesMetadata<TDocument>(c: ClassType<TDocument>) {
    return Reflect.getOwnMetadata(INDEXES_KEY, c) as mongo.IndexSpecification[] | undefined
}
