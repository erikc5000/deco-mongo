import { PropertyConverter } from '../interfaces'
import { ObjectID } from 'bson'

/**
 * Convert a valid MongoDB object ID in string form into an ObjectID
 */
export class ObjectIdConverter implements PropertyConverter {
    toDb(value: any) {
        return new ObjectID(value)
    }

    fromDb(value: ObjectID) {
        return value.toHexString()
    }
}
