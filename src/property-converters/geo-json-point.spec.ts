import { GeoJsonPointConverter } from './index'
import { CoordType } from './geo-json-point'

describe('GeoJSON point converter', () => {
    let converter: GeoJsonPointConverter

    beforeEach(() => {
        converter = new GeoJsonPointConverter()
    })

    describe('to DB', () => {
        it('preserves undefined values', () => {
            expect(converter.toDb(undefined)).toBeUndefined()
        })

        it('preserves null values', () => {
            expect(converter.toDb(null)).toBeNull()
        })

        it('should convert a valid [latitude, longitude] array', () => {
            const toDbValue = converter.toDb([40.0, 45.0])
            expect(typeof toDbValue).toEqual('object')
            expect(toDbValue.type).toEqual('Point')
            expect(toDbValue.coordinates).toEqual([45.0, 40.0])
        })

        it('should optionally convert a valid [longitude, latitude] array', () => {
            const longLatConverter = new GeoJsonPointConverter({ coordType: CoordType.LongLat })
            const toDbValue = longLatConverter.toDb([45.0, 40.0])
            expect(typeof toDbValue).toEqual('object')
            expect(toDbValue.type).toEqual('Point')
            expect(toDbValue.coordinates).toEqual([45.0, 40.0])
        })

        it('throws an exception when given an array with less than 2 elements', () => {
            expect(() => converter.toDb([40.0])).toThrow(Error)
        })

        it('throws an exception when given an array with more than 2 elements', () => {
            expect(() => converter.toDb([40.0, 45.0, 65.0])).toThrow(Error)
        })

        it('throws an exception when given an array with any non-number elements', () => {
            expect(() => converter.toDb([40.0, '45.0'])).toThrow(Error)
            expect(() => converter.toDb(['0.0', '0.0'])).toThrow(Error)
        })
    })

    describe('from DB', () => {
        describe('with any target type', () => {
            it('preserves undefined values', () => {
                expect(converter.fromDb(undefined)).toBeUndefined()
                expect(converter.fromDb(undefined, Object)).toBeUndefined()
                expect(converter.fromDb(undefined, Array)).toBeUndefined()
            })

            it('preserves null values', () => {
                expect(converter.fromDb(null)).toBeNull()
                expect(converter.fromDb(null, Object)).toBeNull()
                expect(converter.fromDb(null, Array)).toBeNull()
            })

            it('should fail to convert coordinates', () => {
                expect(() => converter.fromDb([40, 45.0])).toThrow(Error)
                expect(() => converter.fromDb([40, 45.0], Object)).toThrow(Error)
                expect(() => converter.fromDb([40, 45.0], Array)).toThrow(Error)
            })
        })

        describe('with Array target type', () => {
            it('should convert GeoJSON location objects, irrespective of type', () => {
                const fromDbValue = converter.fromDb(
                    { coordinates: [45.0, 40.0], type: 'NotAPoint' },
                    Array
                )
                expect(fromDbValue).toBeInstanceOf(Array)
                expect(fromDbValue).toHaveLength(2)
                expect(fromDbValue[0]).toBe(40.0)
                expect(fromDbValue[1]).toBe(45.0)
            })

            it('should optionally convert GeoJSON objects to [longitude, latitude]', () => {
                const longLatConverter = new GeoJsonPointConverter({ coordType: CoordType.LongLat })

                const fromDbValue = longLatConverter.fromDb(
                    {
                        coordinates: [45.0, 40.0],
                        type: 'Point'
                    },
                    Array
                )

                expect(fromDbValue).toBeInstanceOf(Array)
                expect(fromDbValue).toHaveLength(2)
                expect(fromDbValue[0]).toBe(45.0)
                expect(fromDbValue[1]).toBe(40.0)
            })
        })

        describe('with unexpected target type', () => {
            it('throws an exception', () => {
                const fromDbValue = converter.fromDb(
                    { coordinates: [45.0, 40.0], type: 'NotAPoint' },
                    Array
                )

                expect(() => converter.fromDb(fromDbValue, Object)).toThrow(Error)
                expect(() => converter.fromDb(fromDbValue, String)).toThrow(Error)
                expect(() => converter.fromDb(fromDbValue, Boolean)).toThrow(Error)
            })
        })
    })
})
