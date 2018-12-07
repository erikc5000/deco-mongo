import { ClassType, PropertyOptions } from '../interfaces'
import { rename } from 'fs'

export const PROPERTY_KEY = Symbol('decoMongo:property')
export const CLASS_PROPERTIES_KEY = Symbol('decoMongo:classProperties')

export class ClassPropertiesMetadata {
    private readonly reverseKeyMap = new Map<string | symbol, string | symbol>()

    mapKey(fromKey: string | symbol, toKey: string | symbol) {
        this.reverseKeyMap.set(toKey, fromKey)
    }

    getKeyFromMappedKey(mappedKey: string) {
        return this.reverseKeyMap.get(mappedKey)
    }
}

export function getPropertyMetadata<TDocument>(
    classType: ClassType<TDocument>,
    propertyKey: string | symbol
) {
    return Reflect.getMetadata(PROPERTY_KEY, classType, propertyKey) as PropertyOptions | undefined
}

export function getClassPropertiesMetadata<TDocument>(classType: ClassType<TDocument>) {
    return Reflect.getMetadata(CLASS_PROPERTIES_KEY, classType) as
        | ClassPropertiesMetadata
        | undefined
}
