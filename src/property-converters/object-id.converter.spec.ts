import { ObjectId } from 'mongodb'
import { ObjectIdConverter } from './object-id.converter'

describe('ObjectId converter', () => {
    describe('to DB', () => {
        describe('when auto-generate is disabled', () => {
            const converter = new ObjectIdConverter()

            it('preserves undefined values', () => {
                expect(converter.toDb(undefined)).toBeUndefined()
            })

            it('throws an exception when given an empty string', () => {
                expect(() => converter.toDb('')).toThrow(Error)
            })
        })

        describe('when auto-generate is true', () => {
            const converter = new ObjectIdConverter({ autoGenerate: true })

            it('generates an ObjectId when given an undefined value', () => {
                expect(converter.toDb(undefined)).toBeInstanceOf(ObjectId)
            })

            it('generates an ObjectId when given an empty string', () => {
                expect(converter.toDb('')).toBeInstanceOf(ObjectId)
            })
        })

        describe('when an auto-generate function is provided', () => {
            const converter = new ObjectIdConverter({
                autoGenerate: () => new ObjectId('5c1f09b080d1cb26dcbb4c9e')
            })

            it('generates an ObjectId when given an undefined value', () => {
                const toDbValue = converter.toDb(undefined)
                expect(toDbValue).toBeInstanceOf(ObjectId)
                expect(toDbValue!.toHexString()).toBe('5c1f09b080d1cb26dcbb4c9e')
            })

            it('generates an ObjectId when given an empty string', () => {
                const toDbValue = converter.toDb('')
                expect(toDbValue).toBeInstanceOf(ObjectId)
                expect(toDbValue!.toHexString()).toBe('5c1f09b080d1cb26dcbb4c9e')
            })
        })

        describe.each([
            new ObjectIdConverter(),
            new ObjectIdConverter({ autoGenerate: true }),
            new ObjectIdConverter({ autoGenerate: () => new ObjectId() })
        ])('with any auto-generate setting (%#)', (converter: ObjectIdConverter) => {
            it('preserves ObjectId values', () => {
                const objectId = new ObjectId('5c1f09b080d1cb26dcbb4c9e')
                const toDbValue = converter.toDb(objectId)
                expect(toDbValue).toBeInstanceOf(ObjectId)
                expect(toDbValue!.toHexString()).toBe('5c1f09b080d1cb26dcbb4c9e')
            })

            it('converts non-empty string values to ObjectId', () => {
                const stringValue = '5c1f09b080d1cb26dcbb4c9e'
                const toDbValue = converter.toDb(stringValue)
                expect(toDbValue).toBeInstanceOf(ObjectId)
                expect((toDbValue as ObjectId).toHexString()).toEqual(stringValue)
            })

            it('throws an exception when given a null value', () => {
                expect(() => converter.toDb(null)).toThrow(Error)
            })

            it('throws an exception when given a number', () => {
                expect(() => converter.toDb(900)).toThrow(Error)
            })

            it('throws an exception when given a non-ObjectId object', () => {
                expect(() => converter.toDb({ myField: 1 })).toThrow(Error)
            })
        })
    })

    describe.each([
        new ObjectIdConverter(),
        new ObjectIdConverter({ autoGenerate: true }),
        new ObjectIdConverter({ autoGenerate: () => new ObjectId() })
    ])('from DB (%#)', (converter: ObjectIdConverter) => {
        describe('with any target type', () => {
            it('preserves undefined values', () => {
                expect(converter.fromDb(undefined)).toBeUndefined()
                expect(converter.fromDb(undefined, ObjectId)).toBeUndefined()
            })

            it('throws an exception when given a null value', () => {
                expect(() => converter.fromDb(null)).toThrow(Error)
                expect(() => converter.fromDb(null, ObjectId)).toThrow(Error)
            })

            it('throws an exception when not given an ObjectId value', () => {
                expect(() => converter.fromDb({})).toThrow(Error)
                expect(() => converter.fromDb(200)).toThrow(Error)
                expect(() => {
                    converter.fromDb('5c1f09b080d1cb26dcbb4c9e')
                }).toThrow(Error)
            })
        })

        describe('with String target type', () => {
            it('converts ObjectId values to string', () => {
                const objectId = new ObjectId()
                const fromDbValue = converter.fromDb(objectId, String)
                expect(fromDbValue).toEqual(objectId.toHexString())
            })
        })

        describe('with ObjectId target type', () => {
            it('preserves ObjectId values', () => {
                const objectId = new ObjectId()
                const fromDbValue = converter.fromDb(objectId, ObjectId)
                expect(fromDbValue).toBeInstanceOf(ObjectId)
                expect((fromDbValue as ObjectId).toHexString()).toBe(objectId.toHexString())
            })
        })

        describe.each([undefined, Object, Number, Function, Date])(
            'with unexpected target type (%p)',
            targetType => {
                it('throws an exception when given an ObjectId value', () => {
                    const objectId = new ObjectId()
                    expect(() => converter.fromDb(objectId, targetType)).toThrow(Error)
                })
            }
        )
    })
})
