import { Binary, ObjectID } from 'bson'
import { ObjectIdConverter } from './object-id';

describe('ObjectID converter', () => {
    let converter: ObjectIdConverter

    beforeEach(() => {
        converter = new ObjectIdConverter()
    })

    describe('to DB', () => {
        it('preserves undefined values', () => {
            expect(converter.toDb(undefined)).toBeUndefined()
        })

        it('preserves null values', () => {
            expect(converter.toDb(null)).toBeNull()
        })

        it('preserves ObjectID values', () => {
            const objectId = new ObjectID
            const toDbValue = converter.toDb(objectId)
            expect(toDbValue).toBeInstanceOf(ObjectID)
            expect((toDbValue as ObjectID).equals(objectId)).toBeTruthy()
        })

        it('converts string values to ObjectID', () => {
            const stringValue = '5c1f09b080d1cb26dcbb4c9e'
            const toDbValue = converter.toDb(stringValue)
            expect(toDbValue).toBeInstanceOf(ObjectID)
            expect((toDbValue as ObjectID).toHexString()).toEqual(stringValue)
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
                expect(converter.fromDb(undefined, ObjectID)).toBeUndefined()
            })

            it('preserves null values', () => {
                expect(converter.fromDb(null)).toBeNull()
                expect(converter.fromDb(null, ObjectID)).toBeNull()
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
                expect((fromDbValue as ObjectID).equals(objectId)).toBeTruthy()
            })
        })

        describe('with unexpected target type', () => {
            it('throws an exception when given an ObjectID value', () => {
                const objectId = new ObjectID()
                expect(() => converter.fromDb(objectId)).toThrow(Error)
                expect(() => converter.fromDb(objectId, Number)).toThrow(Error)
                expect(() => converter.fromDb(objectId, Function)).toThrow(Error)
                expect(() => converter.fromDb(objectId, Date)).toThrow(Error)
            })
        })
    })
})
