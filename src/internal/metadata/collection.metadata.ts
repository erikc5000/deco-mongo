import { CollectionOptions, ClassType } from '../../interfaces'

export const COLLECTION_KEY = Symbol('decoMongo:collection')

export interface CollectionMetadata {
    name: string
    options?: CollectionOptions
}

export function getCollectionMetadata<T extends object>(
    classType: ClassType<T>
): CollectionMetadata | undefined {
    if (Reflect.hasOwnMetadata(COLLECTION_KEY, classType)) {
        return Reflect.getOwnMetadata(COLLECTION_KEY, classType)
    }
}
