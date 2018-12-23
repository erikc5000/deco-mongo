import { Double } from 'bson'
import { PropertyConverter } from '../property-converter'

/**
 * Convert number values to the BSON Double represention
 */
export class DoubleConverter extends PropertyConverter {
    toDb(value: any) {
        if (value == null) {
            return value
        } else if (typeof value === 'number') {
            return new Double(value)
        } else if (typeof value === 'string') {
            return new Double(parseFloat(value))
        } else if (value instanceof Double) {
            return value
        } else {
            throw new Error('Expected a number or string')
        }
    }

    fromDb(value: any, targetType?: any) {
        if (value == null) {
            return value
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

    get supportedTypes() {
        return [Number, Double, String]
    }
}
