import { UuidConverter } from '.'
import { Binary } from 'bson'

describe('UUID converter', () => {
    let converter: UuidConverter

    beforeEach(() => {
        converter = new UuidConverter()
    })

    describe('to DB', () => {
        it('preserves undefined values', () => {
            expect(converter.toDb(undefined)).toBeUndefined()
        })

        it('preserves null values', () => {
            expect(converter.toDb(null)).toBeNull()
        })

        it('preserves UUID Binary values', () => {
            const buffer = Buffer.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)
            const binary = new Binary(buffer, Binary.SUBTYPE_UUID)
            expect(converter.toDb(binary)).toEqual(binary)
        })

        it('throws an exception when given a non-UUID Binary value', () => {
            const buffer = Buffer.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)
            const binary = new Binary(buffer, Binary.SUBTYPE_BYTE_ARRAY)
            expect(() => converter.toDb(binary)).toThrow(Error)
        })

        it('converts string UUIDs', () => {
            const toDbValue = converter.toDb('0d46691c-c7c5-4f38-9aad-fe2ecfca8ef2')
            expect(toDbValue).toBeInstanceOf(Binary)

            const binaryValue = toDbValue as Binary
            expect(binaryValue.sub_type).toBe(Binary.SUBTYPE_UUID)
            expect(binaryValue.buffer.byteLength).toBe(16)
        })

        it('converts Buffer UUIDs', () => {
            const buffer = Buffer.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)
            const toDbValue = converter.toDb(buffer)
            expect(toDbValue).toBeInstanceOf(Binary)

            const binaryValue = toDbValue as Binary
            expect(binaryValue.sub_type).toBe(Binary.SUBTYPE_UUID)
            expect(binaryValue.buffer).toEqual(buffer)
        })

        it('throws an exception when given a number', () => {
            expect(() => converter.toDb(900)).toThrow(Error)
        })

        it('throws an exception when given an object', () => {
            expect(() => converter.toDb({ myField: 1 })).toThrow(Error)
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

            it('throws an exception when given a non-Binary object', () => {
                expect(() => converter.fromDb({})).toThrow(Error)
                expect(() => converter.fromDb(200)).toThrow(Error)
                expect(() => {
                    converter.fromDb('0d46691c-c7c5-4f38-9aad-fe2ecfca8ef2')
                }).toThrow(Error)
            })

            it('throws an exception if the Binary has an unexpected buffer size', () => {
                const buffer = Buffer.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17)
                const binary = new Binary(buffer, Binary.SUBTYPE_UUID)
                expect(() => converter.fromDb(binary)).toThrow(Error)
            })

            it('throws an exception when given a non-UUID Binary', () => {
                const buffer = Buffer.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)
                const binary = new Binary(buffer, Binary.SUBTYPE_FUNCTION)
                expect(() => converter.fromDb(binary)).toThrow(Error)
            })
        })

        describe('with no target type', () => {
            it('converts Binary values to string', () => {
                const buffer = Buffer.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)
                const binary = new Binary(buffer, Binary.SUBTYPE_UUID)
                const fromDbValue = converter.fromDb(binary)

                expect(fromDbValue).toBe('01020304-0506-0708-090a-0b0c0d0e0f10')
            })
        })

        describe('with String target type', () => {
            it('converts Binary values to string', () => {
                const buffer = Buffer.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)
                const binary = new Binary(buffer, Binary.SUBTYPE_UUID)
                const fromDbValue = converter.fromDb(binary, String)

                expect(fromDbValue).toBe('01020304-0506-0708-090a-0b0c0d0e0f10')
            })
        })

        describe('with Binary target type', () => {
            it('preserves UUID Binary values', () => {
                const buffer = Buffer.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)
                const binary = new Binary(buffer, Binary.SUBTYPE_UUID)
                expect(converter.fromDb(binary, Binary)).toEqual(binary)
            })
        })

        describe('with Buffer target type', () => {
            it('converts Binary values to Buffer', () => {
                const buffer = Buffer.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)
                const binary = new Binary(buffer, Binary.SUBTYPE_UUID)
                const fromDbValue = converter.fromDb(binary, Buffer)

                expect(Buffer.isBuffer(fromDbValue)).toBeTruthy()
                expect(fromDbValue as Buffer).toEqual(buffer)
            })
        })

        describe('with unexpected target type', () => {
            it('throws an exception', () => {
                const buffer = Buffer.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)
                const binary = new Binary(buffer, Binary.SUBTYPE_UUID)
                expect(() => converter.fromDb(binary, Number)).toThrow(Error)
                expect(() => converter.fromDb(binary, Function)).toThrow(Error)
                expect(() => converter.fromDb(binary, Date)).toThrow(Error)
            })
        })
    })
})
