import 'reflect-metadata'
import {
    PROPERTY_KEY,
    CLASS_PROPERTIES_KEY,
    getClassPropertiesMetadata,
    ClassPropertiesMetadata
} from '../metadata/property-metadata'
import { PropertyOptions } from '../interfaces'

export function Property(options: PropertyOptions = {}) {
    return (target: any, propertyKey: string | symbol) => {
        const classProperties =
            getClassPropertiesMetadata(target.constructor) || new ClassPropertiesMetadata()

        classProperties.mapKey(propertyKey, options.name || propertyKey)

        Reflect.defineMetadata(CLASS_PROPERTIES_KEY, classProperties, target.constructor)
        Reflect.defineMetadata(PROPERTY_KEY, options, target.constructor, propertyKey)
    }
}
