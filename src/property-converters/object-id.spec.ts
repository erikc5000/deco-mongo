import { ObjectID } from 'bson'
import { ObjectIdConverter } from './object-id'
import { MongoError } from 'mongodb'

describe('ObjectID converter', () => {
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

            it('generates an ObjectID when given an undefined value', () => {
                expect(converter.toDb(undefined)).toBeInstanceOf(ObjectID)
            })

            it('generates an ObjectID when given an empty string', () => {
                expect(converter.toDb('')).toBeInstanceOf(ObjectID)
            })
        })

        describe('when an auto-generate function is provided', () => {
            const converter = new ObjectIdConverter({
                autoGenerate: () => new ObjectID('5c1f09b080d1cb26dcbb4c9e')
            })

            it('generates an ObjectID when given an undefined value', () => {
                const toDbValue = converter.toDb(undefined)
                expect(toDbValue).toBeInstanceOf(ObjectID)
                expect(toDbValue!.toHexString()).toBe('5c1f09b080d1cb26dcbb4c9e')
            })

            it('generates an ObjectID when given an empty string', () => {
                const toDbValue = converter.toDb('')
                expect(toDbValue).toBeInstanceOf(ObjectID)
                expect(toDbValue!.toHexString()).toBe('5c1f09b080d1cb26dcbb4c9e')
            })
        })

        describe.each([
            new ObjectIdConverter(),
            new ObjectIdConverter({ autoGenerate: true }),
            new ObjectIdConverter({ autoGenerate: () => new ObjectID() })
        ])('with any auto-generate setting (%#)', (converter: ObjectIdConverter) => {
            it('preserves ObjectID values', () => {
                const objectId = new ObjectID('5c1f09b080d1cb26dcbb4c9e')
                const toDbValue = converter.toDb(objectId)
                expect(toDbValue).toBeInstanceOf(ObjectID)
                expect(toDbValue!.toHexString()).toBe('5c1f09b080d1cb26dcbb4c9e')
            })

            it('converts non-empty string values to ObjectID', () => {
                const stringValue = '5c1f09b080d1cb26dcbb4c9e'
                const toDbValue = converter.toDb(stringValue)
                expect(toDbValue).toBeInstanceOf(ObjectID)
                expect((toDbValue as ObjectID).toHexString()).toEqual(stringValue)
            })

            it('throws an exception when given a null value', () => {
                expect(() => converter.toDb(null)).toThrow(Error)
            })

            it('throws an exception when given a number', () => {
                expect(() => converter.toDb(900)).toThrow(Error)
            })

            it('throws an exception when given a non-ObjectID object', () => {
                expect(() => converter.toDb({ myField: 1 })).toThrow(Error)
            })
        })
    })

    describe.each([
        new ObjectIdConverter(),
        new ObjectIdConverter({ autoGenerate: true }),
        new ObjectIdConverter({ autoGenerate: () => new ObjectID() })
    ])('from DB (%#)', (converter: ObjectIdConverter) => {
        describe('with any target type', () => {
            it('preserves undefined values', () => {
                expect(converter.fromDb(undefined)).toBeUndefined()
                expect(converter.fromDb(undefined, ObjectID)).toBeUndefined()
            })

            it('throws an exception when given a null value', () => {
                expect(() => converter.fromDb(null)).toThrow(Error)
                expect(() => converter.fromDb(null, ObjectID)).toThrow(Error)
            })

            it('throws an exception when not given an ObjectID value', () => {
                expect(() => converter.fromDb({})).toThrow(Error)
                expect(() => converter.fromDb(200)).toThrow(Error)
                expect(() => {
                    converter.fromDb('5c1f09b080d1cb26dcbb4c9e')
                }).toThrow(Error)
            })
        })

        describe('with String target type', () => {
            it('converts ObjectID values to string', () => {
                const objectId = new ObjectID()
                const fromDbValue = converter.fromDb(objectId, String)
                expect(fromDbValue).toEqual(objectId.toHexString())
            })
        })

        describe('with ObjectID target type', () => {
            it('preserves ObjectID values', () => {
                const objectId = new ObjectID()
                const fromDbValue = converter.fromDb(objectId, ObjectID)
                expect(fromDbValue).toBeInstanceOf(ObjectID)
                expect((fromDbValue as ObjectID).toHexString()).toBe(objectId.toHexString())
            })
        })

        describe.each([undefined, Object, Number, Function, Date])(
            'with unexpected target type (%p)',
            targetType => {
                it('throws an exception when given an ObjectID value', () => {
                    const objectId = new ObjectID()
                    expect(() => converter.fromDb(objectId, targetType)).toThrow(Error)
                })
            }
        )
    })
})
