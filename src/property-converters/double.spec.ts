import { DoubleConverter } from '.'
import { Double } from 'bson'

describe('Double converter', () => {
    let converter: DoubleConverter

    beforeEach(() => {
        converter = new DoubleConverter()
    })

    describe('to DB', () => {
        it('preserves undefined values', () => {
            expect(converter.toDb(undefined)).toBeUndefined()
        })

        it('preserves null values', () => {
            expect(converter.toDb(null)).toBeNull()
        })

        it('preserves Double values', () => {
            const toDbValue = converter.toDb(new Double(5.0))
            expect(toDbValue).toBeInstanceOf(Double)
            expect(toDbValue.valueOf()).toEqual(5.0)
        })

        it('should convert zero number values', () => {
            const toDbValue = converter.toDb(0.0)
            expect(toDbValue).toBeInstanceOf(Double)
            expect(toDbValue.valueOf()).toEqual(0.0)
        })

        it('should convert NaN number values', () => {
            const toDbValue = converter.toDb(NaN)
            expect(toDbValue).toBeInstanceOf(Double)
            expect(toDbValue.valueOf()).toEqual(NaN)
        })

        it('should convert non-zero number values', () => {
            const toDbValue = converter.toDb(50)
            expect(toDbValue).toBeInstanceOf(Double)
            expect(toDbValue.valueOf()).toEqual(50)
        })

        it('should convert number string values', () => {
            const toDbValue = converter.toDb('50')
            expect(toDbValue).toBeInstanceOf(Double)
            expect(toDbValue.valueOf()).toEqual(50)
        })

        it('should convert non-number string values', () => {
            const toDbValue = converter.toDb('this is not a number')
            expect(toDbValue).toBeInstanceOf(Double)
            expect(toDbValue.valueOf()).toEqual(NaN)
        })

        it('should fail to convert boolean values', () => {
            expect(() => converter.toDb(false)).toThrow(Error)
        })

        it('should fail to convert objects', () => {
            expect(() => converter.toDb({})).toThrow(Error)
        })
    })

    describe('from DB', () => {
        describe('with any target type', () => {
            it('preserves undefined values', () => {
                expect(converter.fromDb(undefined)).toBeUndefined()
            })

            it('preserves null values', () => {
                expect(converter.fromDb(null)).toBeNull()
            })

            it('should fail to convert strings', () => {
                expect(() => converter.fromDb('50.0')).toThrow(Error)
                expect(() => converter.fromDb('50.0', Number)).toThrow(Error)
                expect(() => converter.fromDb('50.0', Double)).toThrow(Error)
            })
        })

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
                expect(fromDbValue.valueOf()).toEqual(50.0)
            })

            it('should convert number values', () => {
                const fromDbValue = converter.fromDb(50.0, Double)
                expect(fromDbValue).toBeInstanceOf(Double)
                expect(fromDbValue.valueOf()).toEqual(50.0)
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

        describe('with unexpected target type', () => {
            it('throws an exception', () => {
                expect(() => converter.fromDb(50.0, Boolean)).toThrow(Error)
            })
        })
    })
})
