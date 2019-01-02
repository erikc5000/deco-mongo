import { Property } from '../decorators/index'
import { NestedConverter } from './nested.converter'
import { getPropertiesMetadata } from '../internal/metadata/properties.metadata'

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

    class SuperSpecialCat extends SpecialCat {
        @Property()
        superSpecial: boolean = true
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

        it('converts only decorated properties of the converter class when given an instance of a subclass', () => {
            const document = new SpecialCat()
            expect(converter.toDb(document)).toStrictEqual({ color: 'black' })
        })

        it('throws an exception when given an instance of an unexpected class', () => {
            const document = new DogDocument()
            expect(() => converter.toDb(document)).toThrow(Error)
        })
    })

    describe('from DB', () => {
        const converter = new NestedConverter(SpecialCat)

        describe.each([undefined, Number, String, Object])(
            'with any target type (%p)',
            targetType => {
                it('preserves undefined values', () => {
                    expect(converter.fromDb(undefined, targetType)).toBeUndefined()
                })

                it.each(['string', 1, false])(
                    'throws an exception when given a non-object value (%p)',
                    value => {
                        expect(() => converter.fromDb(value, targetType)).toThrow(Error)
                    }
                )
            }
        )

        describe.each([Object, CatDocument, SpecialCat])(
            'with supported object target type (%p)',
            targetType => {
                it('converts objects to instances of the converter class', () => {
                    const fromDbValue = converter.fromDb({ name: 'Fred' }, targetType)

                    const expected = new SpecialCat()
                    expected.name = 'Fred'

                    expect(fromDbValue).toStrictEqual(expected)
                })
            }
        )

        describe('with Array target type', () => {
            it('converts objects to arrays containing instances of the converter class', () => {
                const fromDbValue = converter.fromDb({ name: 'Fred' }, Array)

                const expected = new SpecialCat()
                expected.name = 'Fred'

                expect(fromDbValue).toStrictEqual([expected])
            })

            it('preserves empty arrays', () => {
                expect(converter.fromDb([], Array)).toEqual([])
            })

            it('converts arrays of objects to arrays containing instances of the converter class', () => {
                const fromDbValue = converter.fromDb([{ name: 'Fred' }], Array)

                const expected = new SpecialCat()
                expected.name = 'Fred'

                expect(fromDbValue).toStrictEqual([expected])
            })

            it('throws an exception when converting arrays containing non-object elements', () => {
                expect(() => converter.fromDb([5], Array)).toThrow(Error)
                expect(() => converter.fromDb([{}, 'string'], Array)).toThrow(Error)
            })
        })

        describe.each([SuperSpecialCat, DogDocument, Boolean, String, Number, Function])(
            'with incompatible target type (%p)',
            targetType => {
                it('throws an exception', () => {
                    expect(() => converter.fromDb({ prop: 'value' }, targetType)).toThrow(Error)
                })
            }
        )
    })
})
