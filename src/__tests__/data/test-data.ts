import { Collection, Indexes } from '../../decorators';

export interface Cat {
    name?: string;
}

@Collection('cats')
export class CatDocument implements Cat {
    name?: string;
}

export const catSchema = {
    bsonType: 'object',
    additionalProperties: false,
    properties: {
        name: {
            bsonType: 'string',
        },
    },
};

@Collection('schemaCats', { jsonSchema: catSchema })
export class SchemaCatDocument implements Cat {
    name?: string;
}

export interface Dog {
    breed?: string;
}

@Collection('dogs')
@Indexes([{ key: { breed: 1 } }])
export class DogDocument implements Dog {
    breed?: string;
}

@Collection('dogs')
@Indexes([])
export class NonIndexedDogDocument implements Dog {
    breed?: string;
}
