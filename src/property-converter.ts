import { IPropertyConverter } from './interfaces'

/**
 * Transforms the value of a property when storing and retrieving data from a database.  By
 * default, the same value is kept when going to and from the database. Where possible, it checks
 * the property type when converting from the database to protect against values that would violate
 * the expectations of the class.  By design, there is no implicit conversion -- a custom converter
 * must be used to deal with incompatible types.
 */
export class PropertyConverter implements IPropertyConverter {
    /**
     * Change the value of a class property to a different value when it is stored in the database.
     * If not defined, the original value will be preserved.
     * @param value The value to be mapped
     */
    toDb(value: any) {
        return value
    }

    /**
     * Populate the value of a class property based on the value retrieved from the database.  If
     * not defined, the database value will be preserved.
     * @param value The value to be mapped
     * @param targetType The type expected by the class's property
     */
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

    /**
     * Returns true if the provided type is supported by this property converter.  By default, it
     * checks if the type is in supportedTypes(), but this behavior may be overridden.
     * @param type The type of the property in the class definition
     */
    supportsType(type: any): boolean {
        const supportedTypes = this.getSupportedTypes()
        return supportedTypes.length === 0 || supportedTypes.some(value => value === type)
    }

    /**
     * An array containing the constructor functions for all supported types.  An empty array
     * indicates that there are no predefined type restrictions.
     */
    get supportedTypes(): Function[] {
        return this.getSupportedTypes()
    }

    /**
     * Returns an array containing the constructor functions for all supported types.  Intended
     * to be overridden in subclasses to place restrictions on allowed types.
     */
    protected getSupportedTypes(): Function[] {
        return []
    }
}
