import { PropertyOptions, TimestampType } from '../interfaces'
import { PropertyConverter } from '../property-converter'
import { CustomPropertyConverter } from './custom-property-converter'

export interface ValidateResult {
    valid: boolean
    error?: string
}

export class MappedProperty {
    readonly mappedKeyName: string
    private readonly timestampType?: TimestampType
    private readonly converter: PropertyConverter

    constructor(
        readonly keyName: string,
        private readonly type: any,
        options: PropertyOptions = {}
    ) {
        this.mappedKeyName = options.name || this.keyName
        this.timestampType = options.timestamp

        if (options.converter == null) {
            this.converter = new PropertyConverter()
        } else if (options.converter instanceof PropertyConverter) {
            this.converter = options.converter
        } else if (typeof options.converter === 'object') {
            this.converter = new CustomPropertyConverter(options.converter)
        } else {
            throw new Error('Invalid property converter')
        }
    }

    get isId() {
        return this.mappedKeyName === '_id'
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

    fromDb(mappedValue: any) {
        return this.converter.fromDb(mappedValue, this.type)
    }

    validate(): ValidateResult {
        if (!this.converter.supportsType(this.type)) {
            let message =
                `The type '${MappedProperty.getTypeString(this.type)}' is ` +
                `incompatible with the specified converter.`

            const supportedTypes = this.converter.supportedTypes
                .map(value => MappedProperty.getTypeString(value))
                .join(', ')

            if (supportedTypes.length > 0) {
                message += `  ${this.converter.constructor.name} supports [${supportedTypes}].`
            }

            return { valid: false, error: message }
        } else {
            return { valid: true }
        }
    }

    private static getTypeString(type: any) {
        switch (type) {
            case Boolean:
                return 'boolean'
            case String:
                return 'string'
            case Number:
                return 'number'
            case Symbol:
                return 'symbol'
            case Object:
                return 'object'
            default:
                return type.name
        }
    }
}
