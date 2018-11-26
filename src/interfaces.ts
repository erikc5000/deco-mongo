import * as mongo from 'mongodb';

export interface CollectionOptions {
    jsonSchema?: boolean | object;
    mongoCreateOptions?: mongo.CollectionCreateOptions;
}

export interface ClassType<T> {
    new(...args: any[]): T;
}
