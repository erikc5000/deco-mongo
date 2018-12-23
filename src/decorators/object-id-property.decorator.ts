import { BasicPropertyOptions } from '../interfaces'
import { Property } from './property.decorator'
import { ObjectIdConverter } from '../property-converters'

const objectIdConverter = new ObjectIdConverter()

/**
 * A Mongo ObjectID property
 * @param options Options that control how the property is mapped
 */
export function ObjectIdProperty(options?: BasicPropertyOptions) {
    return Property({ converter: objectIdConverter, ...options })
}
