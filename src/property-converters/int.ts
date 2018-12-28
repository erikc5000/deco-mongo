import { Int32 } from 'bson'
import { PropertyConverter } from '../property-converter'

/**
 * Convert number values to BSON 32-bit integer represention
 */
export class IntConverter extends PropertyConverter {
    toDb(value: any) {
        if (value === undefined) {
            return undefined
        } else if (typeof value === 'number') {
            return new Int32(value)
        } else if (typeof value === 'string') {
            return new Int32(parseInt(value, 10))
        } else if (value instanceof Int32) {
            return value
        } else {
            throw new Error('Expected a number or string')
        }
    }

    fromDb(value: any, targetType?: any) {
        if (value === undefined) {
            return undefined
        } else if (typeof value !== 'number' && !(value instanceof Int32)) {
            throw new Error('Expected a number or Int32 object')
        }

        switch (targetType) {
            case Number:
                return value.valueOf()
            case Int32:
                if (value instanceof Int32) {
                    return value
                } else {
                    return new Int32(value)
                }
            case String:
                return String(value.valueOf())
            default:
                throw new Error(`Incompatible target type '${targetType}'`)
        }
    }

    getSupportedTypes() {
        return [Number, Int32, String]
    }
}
