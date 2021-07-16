import { ObjectId } from 'mongodb'
import { PropertyConverter } from '../property-converter'

export interface ObjectIdConverterOptions {
    /** Generate a new ObjectId when converting an empty value to the database. */
    autoGenerate?: (() => ObjectId) | boolean
}

/**
 * Convert a valid MongoDB object ID into an ObjectId object
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

                return ObjectId.createFromHexString(value)

            case 'object':
                if (value instanceof ObjectId) {
                    return value
                }

                break
        }

        throw new Error('Expected a string or ObjectId')
    }

    fromDb(value: any, targetType?: any) {
        if (value === undefined) {
            return undefined
        } else if (!(value instanceof ObjectId)) {
            throw new Error('Expected an ObjectId object')
        }

        switch (targetType) {
            case ObjectId:
                return value
            case String:
                return value.toHexString()
            default:
                throw new Error(`Incompatible target type '${targetType}'`)
        }
    }

    getSupportedTypes() {
        return [String, ObjectId]
    }

    private get shouldAutoGenerate() {
        return this.options.autoGenerate ? true : false
    }

    private autoGenerate() {
        if (typeof this.options.autoGenerate === 'function') {
            return this.options.autoGenerate()
        } else {
            return new ObjectId()
        }
    }
}
