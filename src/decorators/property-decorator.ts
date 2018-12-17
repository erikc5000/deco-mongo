import 'reflect-metadata'
import {
    PROPERTIES_KEY,
    getPropertiesMetadata,
    PropertiesMetadata
} from '../metadata/properties-metadata'
import { PropertyOptions } from '../interfaces'

export function Property(options: PropertyOptions = {}) {
    return (target: any, propertyKey: string | symbol) => {
        const properties = getPropertiesMetadata(target.constructor) || new PropertiesMetadata()
        properties.set(propertyKey, options)
        Reflect.defineMetadata(PROPERTIES_KEY, properties, target.constructor)
    }
}
