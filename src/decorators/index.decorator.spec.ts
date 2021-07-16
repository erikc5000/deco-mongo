import { getIndexMetadata } from '../internal/metadata/index.metadata'
import { Index, Indexes } from './index.decorator'

describe('indexes decorator', () => {
    describe('decorated class', () => {
        it('should have metadata when provided with a single specification', () => {
            @Index({ breed: 1 })
            class DogDocument {
                breed?: string
            }

            const metadata = getIndexMetadata(DogDocument)
            expect(metadata).toBeDefined()
            expect(Array.isArray(metadata)).toBeTruthy()
            expect(metadata).toHaveLength(1)
        })

        it('should have metadata when provided with a non-empty array', () => {
            @Indexes([{ key: { breed: 1 } }])
            class DogDocument {
                breed?: string
            }

            const metadata = getIndexMetadata(DogDocument)
            expect(metadata).toBeDefined()
            expect(Array.isArray(metadata)).toBeTruthy()
            expect(metadata).toHaveLength(1)
        })

        it('should have empty metadata when provided with an empty array', () => {
            @Indexes([])
            class NonIndexedDogDocument {
                breed?: string
            }

            const metadata = getIndexMetadata(NonIndexedDogDocument)
            expect(metadata).toEqual([])
        })
    })

    describe('undecorated class', () => {
        it('should have empty metadata', () => {
            class UndecoratedDogDocument {
                breed?: string
            }

            const metadata = getIndexMetadata(UndecoratedDogDocument)
            expect(metadata).toEqual([])
        })
    })

    describe('class with multiple decorators', () => {
        it('should combine all indexes together', () => {
            @Index({ breed: 1 })
            @Indexes([{ key: { name: 1 } }], { unique: true })
            class DogDocument {
                breed?: string
                name?: string
            }

            const metadata = getIndexMetadata(DogDocument)
            expect(metadata).toBeDefined()
            expect(Array.isArray(metadata)).toBeTruthy()
            expect(metadata).toHaveLength(2)
        })
    })
})
