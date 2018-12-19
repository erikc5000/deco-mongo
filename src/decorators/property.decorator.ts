import 'reflect-metadata'
import {
    PROPERTIES_KEY,
    getPropertiesMetadata,
    PropertiesMetadata
} from '../metadata/properties.metadata'
import { PropertyOptions } from '../interfaces'

/**
 * Indicates a relationship between a class property and a document in the database
 * @param options Options that control how the property is mapped
 */
export function Property(options: PropertyOptions = {}) {
    return (target: any, propertyKey: string | symbol) => {
        const properties = getPropertiesMetadata(target.constructor) || new PropertiesMetadata()
        properties.set(propertyKey, options)
        Reflect.defineMetadata(PROPERTIES_KEY, properties, target.constructor)
    }
}
