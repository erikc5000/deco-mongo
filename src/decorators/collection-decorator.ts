import { CollectionOptions } from '../interfaces'
import { CollectionMetadata, COLLECTION_KEY } from '../metadata/collection-metadata'
import 'reflect-metadata'

export function Collection(name: string, options?: CollectionOptions) {
    return (target: any) => {
        const metadata: CollectionMetadata = { name, options }
        Reflect.defineMetadata(COLLECTION_KEY, metadata, target)
    }
}
