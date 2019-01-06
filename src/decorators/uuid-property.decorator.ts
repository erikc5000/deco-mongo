import { BasicPropertyOptions } from '../interfaces'
import { Property } from './property.decorator'
import { UuidConverter, UuidConverterOptions } from '../property-converters'

/** UUID property options */
export interface UuidPropertyOptions extends BasicPropertyOptions, UuidConverterOptions {}

// Converter pool
const uuidConverter = new UuidConverter()
const autoGenUuidV1Converter = new UuidConverter({ autoGenerate: 'v1' })
const autoGenUuidV4Converter = new UuidConverter({ autoGenerate: 'v4' })

/** Get a UUID converter from the pool, if possible.  Otherwise, create one. */
function getConverter(options: UuidPropertyOptions) {
    switch (options.autoGenerate) {
        case false:
        case undefined:
            return uuidConverter
        case 'v1':
            return autoGenUuidV1Converter
        case 'v4':
            return autoGenUuidV4Converter
        default:
            return new UuidConverter({ autoGenerate: options.autoGenerate })
    }
}

/**
 * A UUID property, which should be stored in binary form
 * @param options Options that control how the property is mapped
 */
export function UuidProperty(options: UuidPropertyOptions = {}) {
    return Property({ converter: getConverter(options), ...options })
}
