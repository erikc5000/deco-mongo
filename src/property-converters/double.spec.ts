import { DoubleConverter } from '.'
import { Double } from 'bson'

describe('Double converter', () => {
    let converter: DoubleConverter

    beforeEach(() => {
        converter = new DoubleConverter()
    })

    it('should convert undefined values to DB', () => {
        expect(converter.toDb(undefined)).toBeUndefined()
    })

    it('should convert null values to DB', () => {
        expect(converter.toDb(null)).toBeNull()
    })

    it('should convert zero number values to DB', () => {
        const toDbValue = converter.toDb(0.0)
        expect(toDbValue).toBeInstanceOf(Double)
        expect(toDbValue.valueOf()).toEqual(0.0)
    })

    it('should convert NaN number values to DB', () => {
        const toDbValue = converter.toDb(NaN)
        expect(toDbValue).toBeInstanceOf(Double)
        expect(toDbValue.valueOf()).toEqual(NaN)
    })

    it('should convert non-zero number values to DB', () => {
        const toDbValue = converter.toDb(50)
        expect(toDbValue).toBeInstanceOf(Double)
        expect(toDbValue.valueOf()).toEqual(50)
    })

    it('should fail to convert string values to DB', () => {
        expect(() => converter.toDb('50')).toThrow(Error)
    })

    it('should fail to convert boolean values to DB', () => {
        expect(() => converter.toDb(false)).toThrow(Error)
    })

    it('should fail to convert objects to DB', () => {
        expect(() => converter.toDb({})).toThrow(Error)
    })

    it('should convert undefined values from DB', () => {
        expect(converter.fromDb(undefined)).toBeUndefined()
    })

    it('should convert null values from DB', () => {
        expect(converter.fromDb(null)).toBeNull()
    })

    it('should convert Double values from DB', () => {
        const fromDbValue = converter.fromDb(new Double(50.0))
        expect(typeof fromDbValue).toEqual('number')
        expect(fromDbValue).toEqual(50.0)
    })

    it('should convert number values from DB', () => {
        const fromDbValue = converter.fromDb(50.0)
        expect(typeof fromDbValue).toEqual('number')
        expect(fromDbValue).toEqual(50.0)
    })

    it('should fail to convert strings from DB', () => {
        expect(() => converter.fromDb('50.0')).toThrow(Error)
    })
})