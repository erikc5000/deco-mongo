import { PropertyConverter, ClassType } from '../interfaces'
import { Mapper } from '../mapper'

/**
 * Convert properties of a sub-document individually using a class derived from its interface
 */
export class NestedPropertyConverter<T extends object> implements PropertyConverter {
    private readonly mapper: Mapper<any, T>

    /**
     * Construct a new nested property converter
     * @param classType The class to be used for conversion
     */
    constructor(private readonly classType: ClassType<T>) {
        this.mapper = new Mapper(classType)
    }

    toDb(value: any) {
        if (value == null) {
            return value
        } else if (typeof value !== 'object') {
            throw new Error('Expected an object')
        }

        return this.mapper.mapForInsert(value)
    }

    fromDb(value: any) {
        if (value == null) {
            return value
        } else if (typeof value !== 'object') {
            throw new Error('Expected an object')
        }

        return this.mapper.mapFromResult(value)
    }
}
