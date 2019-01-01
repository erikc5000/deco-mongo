import { UuidConverter } from './uuid.converter'
import { Binary } from 'bson'
import uuid = require('uuid')

describe('UUID converter', () => {
    const sequentialBuffer = Buffer.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)
    const tooBigBuffer = Buffer.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17)

    describe('to DB', () => {
        describe.each([new UuidConverter(), new UuidConverter({ autoGenerate: false })])(
            'when auto-generate is disabled (%#)',
            (converter: UuidConverter) => {
                it('preserves undefined values', () => {
                    expect(converter.toDb(undefined)).toBeUndefined()
                })

                it('throws an exception when given an empty string', () => {
                    expect(() => converter.toDb('')).toThrow(Error)
                })
            }
        )

        describe.each([
            new UuidConverter({ autoGenerate: 'v1' }),
            new UuidConverter({ autoGenerate: 'v4' }),
            new UuidConverter({ autoGenerate: () => uuid.v4() })
        ])('when auto-generate is enabled (%#)', (converter: UuidConverter) => {
            it('generates a valid UUID when given an undefined value', () => {
                const toDbValue = converter.toDb(undefined)
                expect(toDbValue).toBeInstanceOf(Binary)
                expect(toDbValue!.sub_type).toBe(Binary.SUBTYPE_UUID)
                expect(toDbValue!.buffer.byteLength).toBe(16)
            })

            it('generates a valid UUID when given an empty string', () => {
                const toDbValue = converter.toDb('')
                expect(toDbValue).toBeInstanceOf(Binary)
                expect(toDbValue!.sub_type).toBe(Binary.SUBTYPE_UUID)
                expect(toDbValue!.buffer.byteLength).toBe(16)
            })
        })

        describe.each([
            new UuidConverter(),
            new UuidConverter({ autoGenerate: false }),
            new UuidConverter({ autoGenerate: 'v1' }),
            new UuidConverter({ autoGenerate: 'v4' }),
            new UuidConverter({ autoGenerate: () => uuid.v4() })
        ])('with any auto-generate setting (%#)', (converter: UuidConverter) => {
            it('preserves UUID Binary values', () => {
                const buffer = sequentialBuffer
                const binary = new Binary(buffer, Binary.SUBTYPE_UUID)
                expect(converter.toDb(binary)).toEqual(binary)
            })

            it('throws an exception when given a non-UUID Binary value', () => {
                const buffer = sequentialBuffer
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
                const buffer = sequentialBuffer
                const toDbValue = converter.toDb(buffer)
                expect(toDbValue).toBeInstanceOf(Binary)

                const binaryValue = toDbValue as Binary
                expect(binaryValue.sub_type).toBe(Binary.SUBTYPE_UUID)
                expect(binaryValue.buffer).toEqual(buffer)
            })

            it('throws an exception when given a null value', () => {
                expect(() => converter.toDb(null)).toThrow(Error)
            })

            it('throws an exception when given a number', () => {
                expect(() => converter.toDb(900)).toThrow(Error)
            })

            it('throws an exception when given an object', () => {
                expect(() => converter.toDb({ myField: 1 })).toThrow(Error)
            })
        })
    })

    describe('from DB', () => {
        describe.each([
            new UuidConverter(),
            new UuidConverter({ autoGenerate: 'v1' }),
            new UuidConverter({ autoGenerate: 'v4' }),
            new UuidConverter({ autoGenerate: () => uuid.v4() })
        ])('with any auto-generate setting (%#)', (converter: UuidConverter) => {
            describe('with any target type', () => {
                it('preserves undefined values', () => {
                    expect(converter.fromDb(undefined)).toBeUndefined()
                })

                it('throws an exception when given a null value', () => {
                    expect(() => converter.fromDb(null)).toThrow(Error)
                })

                it('throws an exception when given a non-Binary object', () => {
                    expect(() => converter.fromDb({})).toThrow(Error)
                    expect(() => converter.fromDb(200)).toThrow(Error)
                    expect(() => {
                        converter.fromDb('0d46691c-c7c5-4f38-9aad-fe2ecfca8ef2')
                    }).toThrow(Error)
                })

                it('throws an exception if the Binary has an unexpected buffer size', () => {
                    const buffer = tooBigBuffer
                    const binary = new Binary(buffer, Binary.SUBTYPE_UUID)
                    expect(() => converter.fromDb(binary)).toThrow(Error)
                })

                it('throws an exception when given a non-UUID Binary', () => {
                    const buffer = sequentialBuffer
                    const binary = new Binary(buffer, Binary.SUBTYPE_FUNCTION)
                    expect(() => converter.fromDb(binary)).toThrow(Error)
                })
            })

            describe('with String target type', () => {
                it('converts Binary values to string', () => {
                    const buffer = sequentialBuffer
                    const binary = new Binary(buffer, Binary.SUBTYPE_UUID)
                    const fromDbValue = converter.fromDb(binary, String)

                    expect(fromDbValue).toBe('01020304-0506-0708-090a-0b0c0d0e0f10')
                })
            })

            describe('with Binary target type', () => {
                it('preserves UUID Binary values', () => {
                    const buffer = sequentialBuffer
                    const binary = new Binary(buffer, Binary.SUBTYPE_UUID)
                    expect(converter.fromDb(binary, Binary)).toEqual(binary)
                })
            })

            describe('with Buffer target type', () => {
                it('converts Binary values to Buffer', () => {
                    const buffer = sequentialBuffer
                    const binary = new Binary(buffer, Binary.SUBTYPE_UUID)
                    const fromDbValue = converter.fromDb(binary, Buffer)

                    expect(Buffer.isBuffer(fromDbValue)).toBeTruthy()
                    expect(fromDbValue as Buffer).toEqual(buffer)
                })
            })

            describe.each([undefined, Number, Function, Date])(
                'with unexpected target type (%p)',
                targetType => {
                    it('throws an exception when given a Binary value', () => {
                        const buffer = sequentialBuffer
                        const binary = new Binary(buffer, Binary.SUBTYPE_UUID)
                        expect(() => converter.fromDb(binary, targetType)).toThrow(Error)
                    })
                }
            )
        })
    })
})
