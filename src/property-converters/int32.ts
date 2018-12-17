import { PropertyConverter } from '../interfaces'
import { Int32 } from 'bson'

function isInt32(value: any): value is Int32 {
    return typeof value === 'object' && typeof value.valueOf === 'function'
}

/**
 * Convert number values to the BSON Int32 represention
 */
export class Int32Converter implements PropertyConverter {
    toDb(value: any) {
        if (value == null) {
            return value
        } else if (typeof value === 'number') {
            return new Int32(value)
        } else {
            throw new Error('Expected a number or string')
        }
    }

    fromDb(value: any) {
        if (value == null) {
            return value
        } else if (typeof value === 'number') {
            return value
        } else if (isInt32(value)) {
            return value.valueOf()
        } else {
            throw new Error('Expected an Int32 object')
        }
    }
}
