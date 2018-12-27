import { PropertyOptions, TimestampType } from '../interfaces'
import { PropertyConverter } from '../property-converter'
import { CustomPropertyConverter } from './custom-property-converter'
import { DefaultPropertyConverter } from '../property-converters'

export class MappedProperty {
    readonly mappedKeyName: string
    private readonly timestampType?: TimestampType
    private readonly converter: PropertyConverter

    private static readonly defaultConverter = new DefaultPropertyConverter()

    constructor(readonly keyName: string, options: PropertyOptions = {}) {
        this.mappedKeyName = options.name || this.keyName
        this.timestampType = options.timestamp

        if (options.converter == null) {
            this.converter = MappedProperty.defaultConverter
        } else if (options.converter instanceof PropertyConverter) {
            this.converter = options.converter
        } else if (typeof options.converter === 'object') {
            this.converter = new CustomPropertyConverter(options.converter)
        } else {
            throw new Error('Invalid property converter')
        }
    }

    get isTimestamp() {
        return this.timestampType != null
    }

    get isCreateTimestamp() {
        return this.timestampType === TimestampType.Create
    }

    get isUpdateTimestamp() {
        return this.timestampType === TimestampType.Update
    }

    toDb(value: any) {
        return this.converter.toDb(value)
    }

    fromDb(mappedValue: any, targetType?: any) {
        return this.converter.fromDb(mappedValue, targetType)
    }
}
