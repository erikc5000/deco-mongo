import { ObjectID } from 'bson'
import { PropertyConverter } from '../property-converter'

export interface ObjectIdConverterOptions {
    /** Generate a new ObjectID when converting an empty value to the database. */
    autoGenerate?: (() => ObjectID) | boolean
}

/**
 * Convert a valid MongoDB object ID into an ObjectID object
 */
export class ObjectIdConverter extends PropertyConverter {
    constructor(private readonly options: ObjectIdConverterOptions = {}) {
        super()
    }

    toDb(value: any) {
        switch (typeof value) {
            case 'undefined':
                return this.shouldAutoGenerate ? this.autoGenerate() : undefined

            case 'string':
                if (value.length === 0 && this.shouldAutoGenerate) {
                    return this.autoGenerate()
                }

                return ObjectID.createFromHexString(value)

            case 'object':
                if (value instanceof ObjectID) {
                    return value
                }

                break
        }

        throw new Error('Expected a string or ObjectID')
    }

    fromDb(value: any, targetType?: any) {
        if (value === undefined) {
            return undefined
        } else if (!(value instanceof ObjectID)) {
            throw new Error('Expected an ObjectID object')
        }

        switch (targetType) {
            case ObjectID:
                return value
            case String:
                return value.toHexString()
            default:
                throw new Error(`Incompatible target type '${targetType}'`)
        }
    }

    getSupportedTypes() {
        return [String, ObjectID]
    }

    private get shouldAutoGenerate() {
        return this.options.autoGenerate ? true : false
    }

    private autoGenerate() {
        if (typeof this.options.autoGenerate === 'function') {
            return this.options.autoGenerate()
        } else {
            return new ObjectID()
        }
    }
}
