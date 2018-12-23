import { getCollectionMetadata } from '../internal/metadata/collection.metadata'
import { Collection } from './collection.decorator'

describe('collection decorator', () => {
    describe('decorated class', () => {
        it('should have metadata', () => {
            @Collection('cats')
            class CatDocument {
                name?: string
            }

            const metadata = getCollectionMetadata(CatDocument)
            expect(metadata).toBeDefined()
            expect(metadata.name).toBe('cats')
            expect(metadata.options).toBeUndefined()
        })

        // it('should have metadata containing a JSON schema object when provided', () => {
        //     const catSchema = {
        //         bsonType: 'object',
        //         additionalProperties: false,
        //         properties: {
        //             name: {
        //                 bsonType: 'string'
        //             }
        //         }
        //     }

        //     @Collection('schemaCats', { jsonSchema: { use: catSchema } })
        //     class SchemaCatDocument {
        //         name?: string
        //     }

        //     const metadata = getCollectionMetadata(SchemaCatDocument)
        //     expect(metadata).toBeDefined()
        //     expect(metadata.name).toBe('schemaCats')
        //     expect(metadata.options).toBeDefined()
        //     expect(metadata.options!.jsonSchema).toBeDefined()
        //     expect(metadata.options!.jsonSchema!.use).toEqual(catSchema)
        // })
    })

    describe('undecorated class', () => {
        it('throws an exception when attempting to access the metadata', () => {
            class UndecoratedCat {
                name?: string
            }

            expect(() => getCollectionMetadata(UndecoratedCat)).toThrow(Error)
        })
    })

    describe('class with multiple decorators', () => {
        it('throws an exception when the second decorator is processed', () => {
            expect(() => {
                @Collection('cats')
                @Collection('dogs')
                class CatDocument {
                    name?: string
                }
            }).toThrow(Error)
        })
    })
})
