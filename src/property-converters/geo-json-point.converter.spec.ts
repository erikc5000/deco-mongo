import { GeoJsonPointConverter } from './geo-json-point.converter'
import { CoordType } from '../interfaces'

describe('GeoJSON point converter', () => {
    describe('to DB', () => {
        describe.each([
            new GeoJsonPointConverter({ coordType: CoordType.LatLong }),
            new GeoJsonPointConverter({ coordType: CoordType.LongLat })
        ])('with any coord type (%#)', (converter: GeoJsonPointConverter) => {
            it('preserves undefined values', () => {
                expect(converter.toDb(undefined)).toBeUndefined()
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

            it('throws an exception when given a non-array value', () => {
                expect(() => converter.toDb(null)).toThrow(Error)
                expect(() => converter.toDb(true)).toThrow(Error)
                expect(() => converter.toDb('45.0,40.0')).toThrow(Error)
            })
        })

        describe('with lat/long coord type', () => {
            it('should convert a [latitude, longitude] array', () => {
                const converter = new GeoJsonPointConverter()
                const toDbValue = converter.toDb([40.0, 45.0])
                expect(toDbValue).toStrictEqual({ type: 'Point', coordinates: [45.0, 40.0] })
            })
        })

        describe('with long/lat coord type', () => {
            it('should convert a [longitude, latitude] array', () => {
                const converter = new GeoJsonPointConverter({ coordType: CoordType.LongLat })
                const toDbValue = converter.toDb([45.0, 40.0])
                expect(toDbValue).toStrictEqual({ type: 'Point', coordinates: [45.0, 40.0] })
            })
        })
    })

    describe('from DB', () => {
        describe.each([undefined, Array, Object, String, Function])(
            'with any target type (%p)',
            targetType => {
                const converter = new GeoJsonPointConverter()

                it('preserves undefined values', () => {
                    expect(converter.fromDb(undefined, targetType)).toBeUndefined()
                })

                it('throws an exception when given a null value', () => {
                    expect(() => converter.fromDb(null, targetType)).toThrow(Error)
                })

                it('throws an exception when given a coordinate array', () => {
                    expect(() => converter.fromDb([40, 45.0], targetType)).toThrow(Error)
                })
            }
        )

        describe('with Array target type', () => {
            it('converts GeoJSON points to [latitude, longitude]', () => {
                const converter = new GeoJsonPointConverter()

                const fromDbValue = converter.fromDb(
                    { coordinates: [45.0, 40.0], type: 'Point' },
                    Array
                )
                expect(fromDbValue).toBeInstanceOf(Array)
                expect(fromDbValue).toHaveLength(2)
                expect(fromDbValue![0]).toBe(40.0)
                expect(fromDbValue![1]).toBe(45.0)
            })

            it('converts GeoJSON locations to [longitude, latitude]', () => {
                const converter = new GeoJsonPointConverter({ coordType: CoordType.LongLat })

                const fromDbValue = converter.fromDb(
                    { coordinates: [45.0, 40.0], type: 'Point' },
                    Array
                )
                expect(fromDbValue).toBeInstanceOf(Array)
                expect(fromDbValue).toHaveLength(2)
                expect(fromDbValue![0]).toBe(45.0)
                expect(fromDbValue![1]).toBe(40.0)
            })
        })

        describe.each([undefined, Object, String, Boolean])(
            'with unsupported target type (%p)',
            targetType => {
                const converter = new GeoJsonPointConverter()
                const value = { coordinates: [45.0, 40.0], type: 'Point' }

                it('throws an exception', () => {
                    expect(() => converter.fromDb(value, targetType)).toThrow(Error)
                })
            }
        )
    })
})
