import * as mongo from 'mongodb'
import { INDEXES_KEY } from '../metadata/indexes-metadata'
import 'reflect-metadata'

export function Indexes(...indexes: mongo.IndexSpecification[]) {
    return (target: any) => {
        Reflect.defineMetadata(INDEXES_KEY, indexes, target)
    }
}
