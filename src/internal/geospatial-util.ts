import { Coordinates, GeoJsonPoint, CoordType } from '../interfaces'

/**
 * Is this value a coordinate array?
 * @param value The value to test
 */
export function isCoordinates(value: any): value is Coordinates {
    return (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number'
    )
}

/**
 * Is this value a GeoJSON Point?
 * @param value The value to test
 */
export function isGeoJsonPoint(value: any): value is GeoJsonPoint {
    return (
        typeof value === 'object' &&
        value != null &&
        value.type === 'Point' &&
        isCoordinates(value.coordinates)
    )
}

/**
 * If necessary, reverse the order of a coordinate array to get a [latitude, longitude] value.
 * @param value An array of coordinates
 * @param type The order of the coordinates that were provided
 */
export function coordinatesToLatLong(value: Coordinates, type: CoordType): Coordinates {
    return type === CoordType.LatLong ? value : reverseCoordinates(value)
}

/**
 * If necessary, reverse the order of a coordinate array to get a [longitude, latitude] value.
 * @param value An array of coordinates
 * @param type The order of the coordinates that were provided
 */
export function coordinatesToLongLat(value: Coordinates, type: CoordType): Coordinates {
    return type === CoordType.LongLat ? value : reverseCoordinates(value)
}

export function reverseCoordinates(coords: Coordinates) {
    return coords.reverse() as Coordinates
}
