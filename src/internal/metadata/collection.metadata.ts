import { CollectionOptions, ClassType } from '../../interfaces'

export const COLLECTION_KEY = Symbol('decoMongo:collection')

export interface CollectionMetadata {
    name: string
    options?: CollectionOptions
}

export function getCollectionMetadata<TDocument>(c: ClassType<TDocument>) {
    if (!Reflect.hasOwnMetadata(COLLECTION_KEY, c)) {
        throw new Error(`${c} has no @Collection() decorator`)
    }

    return Reflect.getOwnMetadata(COLLECTION_KEY, c) as CollectionMetadata
}
