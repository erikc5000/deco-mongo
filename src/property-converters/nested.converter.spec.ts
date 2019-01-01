import { Property } from '../decorators/index'
import { NestedConverter } from './nested.converter'

describe('nested converter', () => {
    class CatDocument {
        @Property()
        name?: string

        @Property()
        color: string = 'black'

        notDecorated: boolean = true
    }

    class SpecialCat extends CatDocument {
        @Property()
        special: boolean = true
    }

    class UndecoratedCat {
        name?: string
        color: string = 'black'
    }

    class DogDocument {
        @Property()
        barks?: boolean
    }

    describe('constructor', () => {
        it('throws an exception when given an undecorated class', () => {
            expect(() => new NestedConverter(UndecoratedCat)).toThrow(Error)
        })
    })

    describe('to DB', () => {
        const converter = new NestedConverter(CatDocument)

        it('preserves undefined values', () => {
            expect(converter.toDb(undefined)).toBeUndefined()
        })

        it.each(['a string', 1, false])(
            'throws an exception when given a non-object value (%p)',
            value => {
                expect(() => converter.toDb(value)).toThrow(Error)
            }
        )

        it('converts all decorated properties when given an instance of the converter class', () => {
            const document = new CatDocument()
            document.name = 'Alfred'
            expect(converter.toDb(document)).toStrictEqual({ name: 'Alfred', color: 'black' })
        })

        it.skip('converts only decorated properties of the converter class when given an instance of a subclass', () => {
            const document = new SpecialCat()
            expect(converter.toDb(document)).toStrictEqual({ color: 'black' })
        })

        it('throws an exception when given an instance of an unexpected class', () => {
            const document = new DogDocument()
            expect(() => converter.toDb(document)).toThrow(Error)
        })
    })

    // describe('from DB', () => {
    //     describe.each([undefined, Number, String, Object])(
    //         'with any target type (%p)',
    //         targetType => {
    //             it('preserves undefined values', () => {
    //                 expect(converter.fromDb(undefined, targetType)).toBeUndefined()
    //             })
    //         }
    //     )

    //     describe('with Boolean target type', () => {
    //         it('preserves boolean values', () => {
    //             const fromDbValue = converter.fromDb(true, Boolean)
    //             expect(fromDbValue).toBe(true)
    //         })

    //         it.each(['name', {}, 10, []])(
    //             'throws an exception when given a non-boolean value',
    //             value => {
    //                 expect(() => converter.fromDb(value, Boolean)).toThrow(Error)
    //             }
    //         )
    //     })
    // })
})
