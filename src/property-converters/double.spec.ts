import { DoubleConverter } from '.'
import { Double } from 'bson'

describe('Double converter', () => {
    const converter = new DoubleConverter()

    describe('to DB', () => {
        it('preserves undefined values', () => {
            expect(converter.toDb(undefined)).toBeUndefined()
        })

        it('preserves Double values', () => {
            const toDbValue = converter.toDb(new Double(5.0))
            expect(toDbValue).toBeInstanceOf(Double)
            expect(toDbValue!.valueOf()).toEqual(5.0)
        })

        it('should convert zero number values', () => {
            const toDbValue = converter.toDb(0.0)
            expect(toDbValue).toBeInstanceOf(Double)
            expect(toDbValue!.valueOf()).toEqual(0.0)
        })

        it('should convert NaN number values', () => {
            const toDbValue = converter.toDb(NaN)
            expect(toDbValue).toBeInstanceOf(Double)
            expect(toDbValue!.valueOf()).toEqual(NaN)
        })

        it('should convert non-zero number values', () => {
            const toDbValue = converter.toDb(50)
            expect(toDbValue).toBeInstanceOf(Double)
            expect(toDbValue!.valueOf()).toEqual(50)
        })

        it('should convert number string values', () => {
            const toDbValue = converter.toDb('50')
            expect(toDbValue).toBeInstanceOf(Double)
            expect(toDbValue!.valueOf()).toEqual(50)
        })

        it('should convert non-number string values', () => {
            const toDbValue = converter.toDb('this is not a number')
            expect(toDbValue).toBeInstanceOf(Double)
            expect(toDbValue!.valueOf()).toEqual(NaN)
        })

        it('should fail to convert null values', () => {
            expect(() => converter.toDb(null)).toThrow(Error)
        })

        it('should fail to convert boolean values', () => {
            expect(() => converter.toDb(false)).toThrow(Error)
        })

        it('should fail to convert non-Double objects', () => {
            expect(() => converter.toDb({})).toThrow(Error)
        })
    })

    describe('from DB', () => {
        describe.each([undefined, Number, String, Double])(
            'with any target type (%p)',
            targetType => {
                it('preserves undefined values', () => {
                    expect(converter.fromDb(undefined, targetType)).toBeUndefined()
                })

                it('throws an exception when given a null value', () => {
                    expect(() => converter.fromDb(null, targetType)).toThrow(Error)
                })

                it('throws an exception when given an unsupported value type', () => {
                    expect(() => converter.fromDb('50.0', targetType)).toThrow(Error)
                    expect(() => converter.fromDb(false, targetType)).toThrow(Error)
                    expect(() => converter.fromDb({ random: 'object' }, targetType)).toThrow(Error)
                })
            }
        )

        describe('with Number target type', () => {
            it('should convert Double values', () => {
                const fromDbValue = converter.fromDb(new Double(50.0), Number)
                expect(typeof fromDbValue).toEqual('number')
                expect(fromDbValue).toEqual(50.0)
            })

            it('should convert number values', () => {
                const fromDbValue = converter.fromDb(50.0, Number)
                expect(typeof fromDbValue).toEqual('number')
                expect(fromDbValue).toEqual(50.0)
            })
        })

        describe('with Double target type', () => {
            it('should convert Double values', () => {
                const fromDbValue = converter.fromDb(new Double(50.0), Double)
                expect(fromDbValue).toBeInstanceOf(Double)
                expect(fromDbValue!.valueOf()).toEqual(50.0)
            })

            it('should convert number values', () => {
                const fromDbValue = converter.fromDb(50.0, Double)
                expect(fromDbValue).toBeInstanceOf(Double)
                expect(fromDbValue!.valueOf()).toEqual(50.0)
            })
        })

        describe('with String target type', () => {
            it('should convert Double values', () => {
                const fromDbValue = converter.fromDb(new Double(50.0), String)
                expect(typeof fromDbValue).toEqual('string')
                expect(fromDbValue).toEqual('50')
            })

            it('should convert number values', () => {
                const fromDbValue = converter.fromDb(50.0, String)
                expect(typeof fromDbValue).toEqual('string')
                expect(fromDbValue).toEqual('50')
            })
        })

        describe.each([undefined, Boolean, Object, Function])(
            'with unsupported target type (%p)',
            targetType => {
                it('throws an exception', () => {
                    expect(() => converter.fromDb(50.0, targetType)).toThrow(Error)
                })
            }
        )
    })
})
