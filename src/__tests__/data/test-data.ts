import { Collection, Indexes } from '../../decorators'
import { Property } from '../../decorators/property-decorator'

export interface Cat {
    name?: string
}

@Collection('cats')
export class CatDocument implements Cat {
    name?: string
}

export const catSchema = {
    bsonType: 'object',
    additionalProperties: false,
    properties: {
        name: {
            bsonType: 'string'
        }
    }
}

@Collection('schemaCats', { jsonSchema: catSchema })
export class SchemaCatDocument implements Cat {
    name?: string
}

export interface Dog {
    breed?: string
}

@Collection('dogs')
@Indexes({ key: { breed: 1 } })
export class DogDocument implements Dog {
    breed?: string
}

@Collection('dogs')
@Indexes()
export class NonIndexedDogDocument implements Dog {
    breed?: string
}

export interface Bird {
    color?: string
}

@Collection('birds')
export class BirdDocument implements Bird {
    @Property({
        name: 'mappedColor',
        converter: {
            toDb: (value: any) => 'mapped ' + value,
            fromDb: (value: string) => value.replace('mapped ', '')
        }
    })
    color?: string
}
