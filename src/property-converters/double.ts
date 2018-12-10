import { PropertyConverter } from '../interfaces'
import { Double } from 'bson'

function isDouble(value: any): value is Double {
    return typeof value === 'object' && typeof value.valueOf === 'function'
}

/**
 * Convert number values to the BSON Double represention
 */
export class DoubleConverter implements PropertyConverter {
    toDb(value: any) {
        if (value == null) {
            return value
        } else if (typeof value === 'number') {
            return new Double(value)
        } else {
            throw new Error('Expected a number or string')
        }
    }

    fromDb(value: any) {
        if (value == null) {
            return value
        } else if (isDouble(value)) {
            return value.valueOf()
        } else {
            throw new Error('Expected a Double object')
        }
    }
}
