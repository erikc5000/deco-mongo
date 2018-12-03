import { ClassType, PropertyOptions } from '../interfaces'

export const PROPERTY_KEY = Symbol('decoMongo:property')

export function getPropertyMetadata<TDocument>(
    classType: ClassType<TDocument>,
    propertyKey: string | symbol
) {
    if (!Reflect.hasMetadata(PROPERTY_KEY, classType, propertyKey)) return undefined

    return Reflect.getMetadata(PROPERTY_KEY, classType, propertyKey) as PropertyOptions
}
