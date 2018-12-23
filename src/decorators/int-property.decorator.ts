import { BasicPropertyOptions } from '../interfaces'
import { Property } from './property.decorator'
import { IntConverter } from '../property-converters'

const intConverter = new IntConverter()

/**
 * A property that should be stored as a BSON 32-bit integer value
 * @param options Options that control how the property is mapped
 */
export function IntProperty(options?: BasicPropertyOptions) {
    return Property({ converter: intConverter, ...options })
}
