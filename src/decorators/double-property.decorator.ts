import { BasicPropertyOptions } from '../interfaces'
import { Property } from './property.decorator'
import { DoubleConverter } from '../property-converters'

const doubleConverter = new DoubleConverter()

/**
 * A property that should be stored as a BSON double value
 * @param options Options that control how the property is mapped
 */
export function DoubleProperty(options?: BasicPropertyOptions) {
    return Property({ converter: doubleConverter, ...options })
}
