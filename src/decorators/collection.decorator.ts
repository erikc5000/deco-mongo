import { CollectionOptions } from '../interfaces'
import { CollectionMetadata, COLLECTION_KEY } from '../metadata/collection.metadata'
import 'reflect-metadata'

/**
 * Define a mapping between a class and a Mongo collection
 * @param name The name of the collection in Mongo
 * @param options Collection options
 */
export function Collection(name: string, options?: CollectionOptions) {
    return (target: any) => {
        if (Reflect.hasMetadata(COLLECTION_KEY, target)) {
            throw new Error(`Found more than one @Collection() decorator on ${target}`)
        }
        
        const metadata: CollectionMetadata = { name, options }
        Reflect.defineMetadata(COLLECTION_KEY, metadata, target)
    }
}
