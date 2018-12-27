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

    supportsType(type: any): boolean {
        const supportedTypes = this.supportedTypes
        return supportedTypes.length === 0 || type in supportedTypes
    }

    get supportedTypes(): any[] {
        return []
    }
}
