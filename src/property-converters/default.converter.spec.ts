import { DefaultConverter } from './default.converter'

describe('default converter', () => {
    const converter = new DefaultConverter()

    describe('to DB', () => {
        it.each([undefined, null, 6.5, 'a string', { field: 1 }, true])(
            'preserves value (%p)',
            value => {
                expect(converter.toDb(value)).toEqual(value)
            }
        )
    })

    describe('from DB', () => {
        describe.each([undefined, Number, String, Object])(
            'with any target type (%p)',
            targetType => {
                it('preserves undefined values', () => {
                    expect(converter.fromDb(undefined, targetType)).toBeUndefined()
                })
            }
        )

        describe('with Boolean target type', () => {
            it('preserves boolean values', () => {
                const fromDbValue = converter.fromDb(true, Boolean)
                expect(fromDbValue).toBe(true)
            })

            it.each(['name', {}, 10, []])(
                'throws an exception when given a non-boolean value',
                value => {
                    expect(() => converter.fromDb(value, Boolean)).toThrow(Error)
                }
            )
        })

        describe('with Number target type', () => {
            it('preserves number values', () => {
                const fromDbValue = converter.fromDb(50.0, Number)
                expect(fromDbValue).toBe(50.0)
            })

            it.each(['name', {}, false, []])(
                'throws an exception when given a non-number value',
                value => {
                    expect(() => converter.fromDb(value, Number)).toThrow(Error)
                }
            )
        })

        describe('with String target type', () => {
            it('preserves string values', () => {
                const fromDbValue = converter.fromDb('a string', String)
                expect(fromDbValue).toBe('a string')
            })

            it.each([false, {}, 10, []])(
                'throws an exception when given a non-String value',
                value => {
                    expect(() => converter.fromDb(value, String)).toThrow(Error)
                }
            )
        })

        describe('with Array target type', () => {
            it('preserves array values', () => {
                const fromDbValue = converter.fromDb(['5', 5], Array)
                expect(fromDbValue).toEqual(['5', 5])
            })

            it.each([false, {}, 10, 'string'])(
                'throws an exception when given a non-Array value',
                value => {
                    expect(() => converter.fromDb(value, Array)).toThrow(Error)
                }
            )
        })

        describe('with Function target type', () => {
            it('throws an exception', () => {
                expect(() => converter.fromDb(5, Function)).toThrow(Error)
            })
        })
    })
})
