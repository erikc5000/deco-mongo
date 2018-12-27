import { BasicPropertyOptions } from '../interfaces'
import { Property } from './property.decorator'
import { ObjectIdConverter, ObjectIdConverterOptions } from '../property-converters'

export interface ObjectIdPropertyOptions extends BasicPropertyOptions, ObjectIdConverterOptions {}

// Converter pool
const objectIdConverter = new ObjectIdConverter()
const autoGenObjectIdConverter = new ObjectIdConverter({ autoGenerate: true })

/** Get an ObjectID converter from the pool, if possible.  Otherwise, create one. */
function getConverter(options?: ObjectIdPropertyOptions) {
    if (options) {
        switch (options.autoGenerate) {
            case undefined:
            case false:
                return objectIdConverter
            case true:
                return autoGenObjectIdConverter
            default:
                return new ObjectIdConverter({ autoGenerate: options.autoGenerate })
        }
    } else {
        return objectIdConverter
    }
}

/**
 * A Mongo ObjectID property
 * @param options Options that control how the property is mapped
 */
export function ObjectIdProperty(options?: ObjectIdPropertyOptions) {
    return Property({
        converter: getConverter(options),
        ...options
    })
}
