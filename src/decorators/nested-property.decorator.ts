import { BasicPropertyOptions, ClassType } from '../interfaces'
import { Property } from './property.decorator'
import { NestedConverter } from '../property-converters'

/**
 * A sub-document that should be mapped using another class with its own property decorators
 * @param options Options that control how the property is mapped
 */
export function NestedProperty<T extends object>(
    classType: ClassType<T>,
    options?: BasicPropertyOptions
) {
    return Property({ converter: new NestedConverter(classType), ...options })
}
