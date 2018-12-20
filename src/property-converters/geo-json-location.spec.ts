import { GeoJsonConverter } from '.'
import { CoordinateType } from './geo-json-location'

describe('GeoJSON location converter', () => {
    let converter: GeoJsonConverter

    beforeEach(() => {
        converter = new GeoJsonConverter()
    })

    describe('to DB', () => {
        it('should convert undefined values', () => {
            expect(converter.toDb(undefined)).toBeUndefined()
        })

        it('should convert null values', () => {
            expect(converter.toDb(null)).toBeNull()
        })

        it('should convert a valid [latitude, longitude] array', () => {
            const toDbValue = converter.toDb([40.0, 45.0])
            expect(typeof toDbValue).toEqual('object')
            expect(toDbValue.type).toEqual('Point')
            expect(toDbValue.coordinates).toEqual([45.0, 40.0])
        })

        it('should optionally convert a valid [longitude, latitude] array', () => {
            const longLatConverter = new GeoJsonConverter({ coordType: CoordinateType.LongLat })
            const toDbValue = longLatConverter.toDb([45.0, 40.0])
            expect(typeof toDbValue).toEqual('object')
            expect(toDbValue.type).toEqual('Point')
            expect(toDbValue.coordinates).toEqual([45.0, 40.0])
        })

        it('should fail to convert arrays with less than 2 elements', () => {
            expect(() => converter.toDb([40.0])).toThrow(Error)
        })

        it('should fail to convert arrays with more than 2 elements', () => {
            expect(() => converter.toDb([40.0, 45.0, 65.0])).toThrow(Error)
        })

        it('should fail to convert arrays with any non-number elements', () => {
            expect(() => converter.toDb([40.0, '45.0'])).toThrow(Error)
        })
    })

    describe('from DB', () => {
        it('should convert undefined values', () => {
            expect(converter.fromDb(undefined)).toBeUndefined()
        })

        it('should convert null values', () => {
            expect(converter.fromDb(null)).toBeNull()
        })

        it('should convert GeoJSON location objects, irrespective of type', () => {
            const fromDbValue = converter.fromDb({ coordinates: [45.0, 40.0], type: 'NotAPoint' })
            expect(fromDbValue).toBeInstanceOf(Array)
            expect(fromDbValue).toHaveLength(2)
            expect(fromDbValue[0]).toBe(40.0)
            expect(fromDbValue[1]).toBe(45.0)
        })

        it('should optionally convert GeoJSON objects to [longitude, latitude]', () => {
            const longLatConverter = new GeoJsonConverter({ coordType: CoordinateType.LongLat })

            const fromDbValue = longLatConverter.fromDb({
                coordinates: [45.0, 40.0],
                type: 'Point'
            })

            expect(fromDbValue).toBeInstanceOf(Array)
            expect(fromDbValue).toHaveLength(2)
            expect(fromDbValue[0]).toBe(45.0)
            expect(fromDbValue[1]).toBe(40.0)
        })

        it('should fail to convert coordinates', () => {
            expect(() => converter.fromDb([40, 45.0])).toThrow(Error)
        })
    })
})
