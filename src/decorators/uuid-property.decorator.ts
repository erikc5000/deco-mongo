import { BasicPropertyOptions } from '../interfaces'
import { Property } from './property.decorator'
import { UuidConverter } from '../property-converters'

const uuidConverter = new UuidConverter()

/**
 * A UUID property, which should be stored in binary form
 * @param options Options that control how the property is mapped
 */
export function UuidProperty(options?: BasicPropertyOptions) {
    return Property({ converter: uuidConverter, ...options })
}
