import { ObjectID } from 'bson'
import { PropertyConverter } from '../property-converter'

export interface ObjectIdConverterOptions {
    /** Generate a new ObjectID when converting an empty value to the database. */
    autoGenerate?: boolean
}

/**
 * Convert a valid MongoDB object ID into an ObjectID object
 */
export class ObjectIdConverter extends PropertyConverter {
    constructor(private readonly options?: ObjectIdConverterOptions) {
        super()
    }

    toDb(value: any) {
        if (value == null) {
            if (this.options && this.options.autoGenerate) {
                return new ObjectID()
            } else {
                return value
            }
        } else if (typeof value === 'string') {
            return new ObjectID(value)
        } else if (value instanceof ObjectID) {
            return value
        } else {
            throw new Error('Expected a string or ObjectID')
        }
    }

    fromDb(value: any, targetType?: any) {
        if (value == null) {
            return value
        } else if (!(value instanceof ObjectID)) {
            throw new Error('Expected an ObjectID object')
        }

        switch (targetType) {
            case ObjectID:
                return value
            case String:
                return value.toHexString()
            default:
                throw new Error('Incompatible target type')
        }
    }

    get supportedTypes() {
        return [String, ObjectID]
    }
}
