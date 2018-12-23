export interface IPropertyToDb {
    /**
     * Change the value of a class property to a different value when it is stored in the database.
     * If not defined, the original value will be preserved.
     * @param value The value to be mapped
     */
    toDb?(value: any): any
}

export interface IPropertyFromDb {
    /**
     * Populate the value of a class property based on the value retrieved from the database.  If
     * not defined, the database value will be preserved.
     * @param value The value to be mapped
     * @param targetType The type expected by the class's property
     */
    fromDb?(value: any, targetType?: any): any
}

export interface IPropertyConverter extends IPropertyToDb, IPropertyFromDb {}

export const enum TimestampType {
    Create = 1,
    Update
}

export interface BasicPropertyOptions {
    /** The name that this property should have when mapped to the database */
    name?: string
}

export interface PropertyOptions extends BasicPropertyOptions {
    converter?: IPropertyConverter
    timestamp?: TimestampType
}

export interface TimestampPropertyOptions extends BasicPropertyOptions {
    converter?: IPropertyFromDb
}

// enum BsonType {
//     Double = 'double',
//     String = 'string',
//     Object = 'object',
//     Array = 'array',
//     BinaryData = 'binData',
//     Undefined = 'undefined',
//     ObjectId = 'objectid',
//     Boolean = 'boolean',
//     Date = 'date',
//     Null = 'null',
//     Int32 = 'int32'
// }
