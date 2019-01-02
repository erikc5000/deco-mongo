import 'reflect-metadata'
import {
    PROPERTIES_KEY,
    PropertiesMetadata,
    getPropertiesMetadata
} from '../internal/metadata/properties.metadata'
import { PropertyOptions } from '../interfaces'
import { MappedProperty } from '../internal/mapped-property'

/**
 * Indicates a relationship between a class property and a document in the database
 * @param options Options that control how the property is mapped
 */
export function Property(options?: PropertyOptions) {
    return (target: any, propertyKey: string | symbol) => {
        let properties = getPropertiesMetadata(target.constructor)

        if (!properties) {
            properties = new PropertiesMetadata(target.constructor)
            Reflect.defineMetadata(PROPERTIES_KEY, properties, target.constructor)
        }

        const type = Reflect.getMetadata('design:type', target, propertyKey)
        properties.push(new MappedProperty(String(propertyKey), type, options))
    }
}
