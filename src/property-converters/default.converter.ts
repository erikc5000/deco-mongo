import { PropertyConverter } from '../property-converter'

/**
 * The default property converter, which keeps the same value when going to and from the database.
 * Where possible, it checks the property type when converting from the database to protect against
 * values that would violate the expectations of the class.  By design, there is no implicit
 * conversion -- a custom converter must be used to deal with incompatible types.
 */
export class DefaultConverter extends PropertyConverter {
    toDb(value: any) {
        return value
    }

    fromDb(value: any, targetType?: any): any {
        if (value === undefined) {
            return undefined
        }

        switch (targetType) {
            case Boolean:
                if (typeof value !== 'boolean') {
                    throw new Error('Expected a boolean value')
                }
                break
            case Number:
                if (typeof value !== 'number') {
                    throw new Error('Expected a number value')
                }
                break
            case String:
                if (typeof value !== 'string') {
                    throw new Error('Expected a string value')
                }
                break
            case Array:
                if (!Array.isArray(value)) {
                    throw new Error('Expected an array')
                }
                break
            case Function:
                throw new Error('Database values cannot be restored into a function')
        }

        return value
    }
}
