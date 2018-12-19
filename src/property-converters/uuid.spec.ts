import { UuidConverter } from '.'
import { Binary } from 'bson'

describe('UUID converter', () => {
    let converter: UuidConverter

    beforeEach(() => {
        converter = new UuidConverter()
    })

    it('should convert undefined values to DB', () => {
        expect(converter.toDb(undefined)).toBeUndefined()
    })

    it('should convert null values to DB', () => {
        expect(converter.toDb(null)).toBeNull()
    })

    it('should convert valid string UUIDs to DB', () => {
        const toDbValue = converter.toDb('0d46691c-c7c5-4f38-9aad-fe2ecfca8ef2')
        expect(toDbValue).toBeInstanceOf(Binary)
        expect((toDbValue as Binary).sub_type).toBe(Binary.SUBTYPE_UUID)
        // expect((toDbValue as Binary).buffer).toEqual(Binary.SUBTYPE_UUID)
    })

    it('should convert undefined values from DB', () => {
        expect(converter.fromDb(undefined)).toBeUndefined()
    })

    it('should convert null values from DB', () => {
        expect(converter.fromDb(null)).toBeNull()
    })

    // it('should convert Double values from DB', () => {
    //     const fromDbValue = converter.fromDb(new Double(50.0))
    //     expect(typeof fromDbValue).toEqual('number')
    //     expect(fromDbValue).toEqual(50.0)
    // })

    // it('should fail to convert numbers from DB', () => {
    //     expect(() => converter.fromDb(50.0)).toThrow(Error)
    // })
})
