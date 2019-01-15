import { ClassType } from '../../interfaces'
import * as mongo from 'mongodb'

export const INDEXES_KEY = Symbol('decoMongo:indexes')

export function getIndexesMetadata<T extends object>(classType: ClassType<T>) {
    return Reflect.getOwnMetadata(INDEXES_KEY, classType) as mongo.IndexSpecification[] | undefined
}
