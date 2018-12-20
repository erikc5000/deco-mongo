import { DoubleConverter } from '.'
import { Double } from 'bson'

describe('Double converter', () => {
    let converter: DoubleConverter

    beforeEach(() => {
        converter = new DoubleConverter()
    })

    describe('to DB', () => {
        it('should convert undefined values', () => {
            expect(converter.toDb(undefined)).toBeUndefined()
        })

        it('should convert null values', () => {
            expect(converter.toDb(null)).toBeNull()
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

        it('should fail to convert string values', () => {
            expect(() => converter.toDb('50')).toThrow(Error)
        })

        it('should fail to convert boolean values', () => {
            expect(() => converter.toDb(false)).toThrow(Error)
        })

        it('should fail to convert objects', () => {
            expect(() => converter.toDb({})).toThrow(Error)
        })
    })

    describe('from DB', () => {
        it('should convert undefined values', () => {
            expect(converter.fromDb(undefined)).toBeUndefined()
        })

        it('should convert null values', () => {
            expect(converter.fromDb(null)).toBeNull()
        })

        it('should convert Double values', () => {
            const fromDbValue = converter.fromDb(new Double(50.0))
            expect(typeof fromDbValue).toEqual('number')
            expect(fromDbValue).toEqual(50.0)
        })

        it('should convert number values', () => {
            const fromDbValue = converter.fromDb(50.0)
            expect(typeof fromDbValue).toEqual('number')
            expect(fromDbValue).toEqual(50.0)
        })

        it('should fail to convert strings', () => {
            expect(() => converter.fromDb('50.0')).toThrow(Error)
        })
    })
})
