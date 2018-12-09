import { ClassType, PropertyOptions } from '../interfaces'
import { rename } from 'fs'

export const PROPERTY_KEY = Symbol('decoMongo:property')
export const CLASS_PROPERTIES_KEY = Symbol('decoMongo:classProperties')

export class ClassPropertiesMetadata {
    private readonly reverseKeyMap = new Map<string | symbol, string | symbol>()
    private readonly createTimestampList: (string | symbol)[] = []
    private readonly updateTimestampList: (string | symbol)[] = []

    mapKey(fromKey: string | symbol, toKey: string | symbol) {
        this.reverseKeyMap.set(toKey, fromKey)
    }

    getKeyFromMappedKey(mappedKey: string | symbol) {
        return this.reverseKeyMap.get(mappedKey)
    }

    addTimestampKey(name: string | symbol, type: 'create' | 'update') {
        if (type === 'create') {
            this.createTimestampList.push(name)
        } else {
            this.updateTimestampList.push(name)
        }
    }

    get allTimestampKeys() {
        return [...this.createTimestampList, ...this.updateTimestampList]
    }

    get createTimestampKeys() {
        return this.createTimestampList
    }

    get updateTimestampKeys() {
        return this.updateTimestampList
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
