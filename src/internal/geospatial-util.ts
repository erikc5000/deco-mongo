import { Coordinates, GeoJsonPoint, CoordType } from '../interfaces'

export function isCoordinates(value: any): value is Coordinates {
    return (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number'
    )
}

export function isGeoJsonPoint(value: any): value is GeoJsonPoint {
    return (
        typeof value === 'object' &&
        value != null &&
        value.type === 'Point' &&
        isCoordinates(value.coordinates)
    )
}

export function toLatLong(value: Coordinates, type: CoordType): Coordinates {
    return type === CoordType.LatLong ? value : [value[1], value[0]]
}

export function toLongLat(value: Coordinates, type: CoordType): Coordinates {
    return type === CoordType.LongLat ? value : [value[1], value[0]]
}
