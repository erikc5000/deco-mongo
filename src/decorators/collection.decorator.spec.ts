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
            expect(metadata!.name).toBe('cats')
            expect(metadata!.options).toBeUndefined()
        })
    })

    describe('undecorated class', () => {
        it('should not have metadata', () => {
            class UndecoratedCat {
                name?: string
            }

            expect(getCollectionMetadata(UndecoratedCat)).toBeUndefined()
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
