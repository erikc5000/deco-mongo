import { ClassType } from '../interfaces';
import * as mongo from 'mongodb';

export const INDEXES_KEY = Symbol('decoMongo:indexes');

export function getIndexesMetadata<TDocument>(c: ClassType<TDocument>) {
    if (!Reflect.hasMetadata(INDEXES_KEY, c))
        return undefined;

    return Reflect.getMetadata(INDEXES_KEY, c) as mongo.IndexSpecification[];
}
