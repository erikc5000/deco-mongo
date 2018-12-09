import * as mongo from 'mongodb'

export interface ClassType<T> {
    new (...args: any[]): T
}

export interface CollectionOptions {
    jsonSchema?: boolean | object
    mongoCreateOptions?: mongo.CollectionCreateOptions
}

export interface PropertyConverter {
    toDb(value: any): any
    fromDb(value: any, targetType?: any): any
}

export interface PropertyOptions {
    name?: string
    converter?: PropertyConverter
    timestamp?: 'create' | 'update'
}
