import { PropertyConverter } from '../interfaces'
import { ObjectID } from 'bson'

function isObjectID(value: any): value is ObjectID {
    return typeof value === 'object' && value.toHexString
}

/**
 * Convert a valid MongoDB object ID in string form into an ObjectID
 */
export class ObjectIdConverter implements PropertyConverter {
    toDb(value: any) {
        return new ObjectID(value)
    }

    fromDb(value: any) {
        if (!isObjectID(value)) {
            throw new Error('Expected an ObjectID object')
        }

        return value.toHexString()
    }
}
