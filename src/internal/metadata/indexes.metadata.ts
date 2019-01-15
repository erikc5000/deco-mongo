import { ClassType } from '../../interfaces'
import * as mongo from 'mongodb'

export const INDEXES_KEY = Symbol('decoMongo:indexes')

export function getIndexesMetadata<T extends object>(
    classType: ClassType<T>
): mongo.IndexSpecification[] {
    return Reflect.hasOwnMetadata(INDEXES_KEY, classType)
        ? Reflect.getOwnMetadata(INDEXES_KEY, classType)
        : []
}
