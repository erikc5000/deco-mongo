import { BasicPropertyOptions } from '../interfaces'
import { Property } from './property.decorator'
import { ObjectIdConverter, ObjectIdConverterOptions } from '../property-converters'

const objectIdConverter = new ObjectIdConverter()
const autoGenObjectIdConverter = new ObjectIdConverter({ autoGenerate: true })

export interface ObjectIdPropertyOptions extends BasicPropertyOptions, ObjectIdConverterOptions {}

/**
 * A Mongo ObjectID property
 * @param options Options that control how the property is mapped
 */
export function ObjectIdProperty(options?: ObjectIdPropertyOptions) {
    return Property({
        converter: options && options.autoGenerate ? autoGenObjectIdConverter : objectIdConverter,
        ...options
    })
}
