import { PropertyConverter, ClassType } from '../interfaces'
import { mapObjectToDatabase } from '../mapper'

/**
 * Convert properties of a sub-document individually using a class derived from its interface
 * @param c The class to be used for conversion
 */
export class NestedPropertyConverter<T extends object> implements PropertyConverter {
    constructor(private readonly classType: ClassType<T>) {}

    toDb(value: any) {
        if (typeof value !== 'object') {
            throw new Error('Expected an object')
        }

        return mapObjectToDatabase(value, this.classType)
    }

    fromDb(value: any) {
        return value
    }
}
