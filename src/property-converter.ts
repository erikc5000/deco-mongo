import { IPropertyConverter } from './interfaces'

/**
 * Transforms the value of a property when storing and retrieving data from a database.
 */
export abstract class PropertyConverter implements IPropertyConverter {
    /**
     * Change the value of a class property to a different value when it is stored in the database.
     * If not defined, the original value will be preserved.
     * @param value The value to be mapped
     */
    abstract toDb(value: any): any

    /**
     * Populate the value of a class property based on the value retrieved from the database.  If
     * not defined, the database value will be preserved.
     * @param value The value to be mapped
     * @param targetType The type expected by the class's property
     */
    abstract fromDb(value: any, targetType?: any): any

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
