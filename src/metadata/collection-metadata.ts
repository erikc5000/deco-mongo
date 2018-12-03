import { CollectionOptions, ClassType } from '../interfaces'

export const COLLECTION_KEY = Symbol('decoMongo:collection')

export interface CollectionMetadata {
    name: string
    options?: CollectionOptions
}

export function getCollectionMetadata<TDocument>(c: ClassType<TDocument>) {
    if (!Reflect.hasMetadata(COLLECTION_KEY, c)) {
        throw Error(`${c} has no @Collection() decorator`)
    }

    const metadata = Reflect.getMetadata(COLLECTION_KEY, c) as CollectionMetadata

    if (typeof metadata.name !== 'string') {
        throw Error(`${c}: @Collection() name must be a string`)
    } else if (metadata.options && typeof metadata.options !== 'object') {
        throw Error(`${c}: @Collection() options must be an object`)
    }

    return metadata
}
