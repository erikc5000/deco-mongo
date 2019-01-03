import { Mapper } from '../mapper'
import { PropertyConverter } from '../property-converter'
import { ClassType } from '../interfaces'

/**
 * Convert properties of a sub-document individually using a class that implements its interface
 */
export class NestedConverter<T extends object> extends PropertyConverter {
    private readonly mapper: Mapper<T>
    private cachedSupportedTypes?: any[]

    /**
     * Construct a new nested property converter
     * @param classType The class to be used for conversion
     */
    constructor(private readonly classType: ClassType<T>) {
        super()
        this.mapper = new Mapper(classType, { nested: true })
    }

    toDb(value: any) {
        if (value === undefined) {
            return undefined
        } else if (typeof value !== 'object') {
            throw new Error('Expected an object')
        }

        return this.mapper.mapForInsert(value)
    }

    fromDb(value: any, targetType?: any) {
        if (value === undefined) {
            return undefined
        } else if (typeof value !== 'object') {
            throw new Error('Expected an object or array of objects')
        } else if (!this.supportsType(targetType)) {
            throw new Error(`Incompatible target type '${targetType.name}'`)
        }

        if (targetType === Array) {
            if (!Array.isArray(value)) {
                return [this.mapper.mapFromResult(value)]
            } else {
                return this.mapper.mapFromResults(value)
            }
        } else {
            return this.mapper.mapFromResult(value)
        }
    }

    getSupportedTypes() {
        if (!this.cachedSupportedTypes) {
            this.cachedSupportedTypes = [Array, Object, this.classType]

            for (
                let parentClass = Object.getPrototypeOf(this.classType.prototype.constructor);
                typeof parentClass.prototype !== 'undefined';
                parentClass = Object.getPrototypeOf(parentClass.prototype.constructor)
            ) {
                this.cachedSupportedTypes.push(parentClass)
            }
        }

        return this.cachedSupportedTypes
    }
}
