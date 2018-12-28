import { Double } from 'bson'
import { PropertyConverter } from '../property-converter'

/**
 * Convert number values to the BSON Double represention
 */
export class DoubleConverter extends PropertyConverter {
    toDb(value: any) {
        switch (typeof value) {
            case 'undefined':
                return undefined
            case 'number':
                return new Double(value)
            case 'string':
                return new Double(parseFloat(value))
            case 'object':
                if (value instanceof Double) {
                    return value
                }
                break
        }

        throw new Error('Expected a number or string')
    }

    fromDb(value: any, targetType?: any) {
        if (value === undefined) {
            return undefined
        } else if (typeof value !== 'number' && !(value instanceof Double)) {
            throw new Error('Expected a number or Double object')
        }

        switch (targetType) {
            case Number:
                return value.valueOf()
            case Double:
                if (value instanceof Double) {
                    return value
                } else {
                    return new Double(value)
                }
            case String:
                return String(value.valueOf())
            default:
                throw new Error(`Incompatible target type '${targetType}'`)
        }
    }

    getSupportedTypes() {
        return [Number, Double, String]
    }
}
