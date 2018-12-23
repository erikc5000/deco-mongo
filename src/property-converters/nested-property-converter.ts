import { Mapper } from '../mapper'
import { PropertyConverter } from '../property-converter'
import { ClassType } from '../interfaces'

/**
 * Convert properties of a sub-document individually using a class that implements its interface
 */
export class NestedPropertyConverter<T extends object> extends PropertyConverter {
    private readonly mapper: Mapper<any, T>

    /**
     * Construct a new nested property converter
     * @param classType The class to be used for conversion
     */
    constructor(classType: ClassType<T>) {
        super()
        this.mapper = new Mapper(classType, { nested: true })
    }

    toDb(value: any) {
        if (value == null) {
            return value
        } else if (typeof value !== 'object') {
            throw new Error('Expected an object')
        }

        return this.mapper.mapForInsert(value)
    }

    fromDb(value: any, targetType?: any) {
        if (value == null) {
            return value
        } else if (typeof value !== 'object') {
            throw new Error('Expected an object')
        }

        return this.mapper.mapFromResult(value)
    }
}
