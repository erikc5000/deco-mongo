import { IPropertyConverter } from './interfaces/index'

/**
 * Transforms the value of a property when storing and retrieving data from a database.
 */
export abstract class PropertyConverter implements IPropertyConverter {
    /**
     * Change the value of a class property to a different value when it is stored in the database.
     * If not defined, the original value will be preserved.
     * @param value The value to be mapped
     */
    toDb(value: any): any {
        return value
    }

    /**
     * Populate the value of a class property based on the value retrieved from the database.  If
     * not defined, the database value will be preserved.
     * @param value The value to be mapped
     * @param targetType The type expected by the class's property
     */
    fromDb(value: any, targetType?: any): any {
        return value
    }

    get supportedTypes(): any[] {
        return []
    }
}

/**
 * The default property converter, which keeps the same value when going to and from the database.
 */
export class DefaultPropertyConverter extends PropertyConverter {}
