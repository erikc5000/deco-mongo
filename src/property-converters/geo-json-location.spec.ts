import { GeoJsonConverter } from '.'

describe('GeoJSON location converter', () => {
    let converter: GeoJsonConverter

    beforeEach(() => {
        converter = new GeoJsonConverter()
    })

    it('should convert undefined values to DB', () => {
        expect(converter.toDb(undefined)).toBeUndefined()
    })

    it('should convert null values to DB', () => {
        expect(converter.toDb(null)).toBeNull()
    })

    it('should convert a valid coordinate array to DB', () => {
        const toDbValue = converter.toDb([40.0, 45.0])
        expect(typeof toDbValue).toEqual('object')
        expect(toDbValue.type).toEqual('Point')
        expect(toDbValue.coordinates).toEqual([45.0, 40.0])
    })

    it('should fail to convert arrays with less than 2 elements to DB', () => {
        expect(() => converter.toDb([40.0])).toThrow(Error)
    })

    it('should fail to convert arrays with more than 2 elements to DB', () => {
        expect(() => converter.toDb([40.0, 45.0, 65.0])).toThrow(Error)
    })

    it('should fail to convert arrays with any non-number elements to DB', () => {
        expect(() => converter.toDb([40.0, '45.0'])).toThrow(Error)
    })

    it('should convert undefined values from DB', () => {
        expect(converter.fromDb(undefined)).toBeUndefined()
    })

    it('should convert null values from DB', () => {
        expect(converter.fromDb(null)).toBeNull()
    })

    it('should convert Geo JSON location objects from DB, irrespective of type', () => {
        const fromDbValue = converter.fromDb({ coordinates: [45.0, 40.0], type: 'NotAPoint' })
        expect(fromDbValue).toBeInstanceOf(Array)
        expect(fromDbValue).toHaveLength(2)
        expect(fromDbValue[0]).toBe(40.0)
        expect(fromDbValue[1]).toBe(45.0)
    })

    it('should fail to convert coordinates from DB', () => {
        expect(() => converter.fromDb([40, 45.0])).toThrow(Error)
    })
})
