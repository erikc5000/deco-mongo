import * as mongo from 'mongodb'

export interface ClassType<T> {
    new (...args: any[]): T
}

export type AutoApplyAction = 'always' | 'ifNewCollection' | 'never'

/** JSON Schema options */
export interface JsonSchemaOptions {
    /** Generate a schema based on the collection's class definition */
    // generate?: boolean

    /** Use an existing object defining the schema.  Takes precedence over a generated schema. */
    use?: object

    /**
     * If you wish to automatically apply the schema to the collection, you can do so with this
     * setting.  The default is 'ifNewCollection', which will apply the schema only if the
     * collection doesn't exist in the database already.  The 'always' option will additionally
     * update an existing collection's validator to reflect the current state of the schema, which
     * could be dangerous in production, so be careful with it.  If you wish to avoid
     * applying a validator to the collection automatically, use 'never' -- you can still apply a
     * JSON schema manually.
     */
    autoApply?: AutoApplyAction
}

export interface CollectionOptions {
    jsonSchema?: JsonSchemaOptions
    autoCreateIndexes?: AutoApplyAction
    mongoCreateOptions?: mongo.CollectionCreateOptions
}

export interface PropertyConverter {
    toDb?(value: any): any
    fromDb?(value: any, targetType?: object): any
}

export type TimestampType = 'create' | 'update'

export interface PropertyOptions {
    name?: string
    converter?: PropertyConverter
    timestamp?: TimestampType
}
