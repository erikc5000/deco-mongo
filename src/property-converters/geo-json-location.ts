import { PropertyConverter } from '../interfaces'

interface GeoJsonLocation {
    coordinates: [number, number]
    type: string
}

type Coordinates = [number, number]

export enum CoordinateType {
    LatLong = 'latLong',
    LongLat = 'longLat'
}

export interface GeoJsonConverterOptions {
    coordType: CoordinateType
}

function isCoordinates(value: any): value is Coordinates {
    return (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number'
    )
}

function isGeoJsonLocation(value: any): value is GeoJsonLocation {
    return (
        typeof value === 'object' &&
        typeof value.type === 'string' &&
        isCoordinates(value.coordinates)
    )
}

export class GeoJsonConverter implements PropertyConverter {
    constructor(
        private readonly options: GeoJsonConverterOptions = { coordType: CoordinateType.LatLong }
    ) {}

    toDb(value: any) {
        if (value == null) {
            return value
        } else if (!isCoordinates(value)) {
            throw new Error(`Expected an array containing '[number, number]'`)
        }

        const location: GeoJsonLocation = {
            coordinates:
                this.options.coordType === CoordinateType.LatLong
                    ? [value[1], value[0]]
                    : [value[0], value[1]],
            type: 'Point'
        }

        return location
    }

    fromDb(value: any): Coordinates {
        if (value == null) {
            return value
        } else if (!isGeoJsonLocation(value)) {
            throw new Error('Expected a valid GeoJSON location')
        }

        return this.options.coordType === CoordinateType.LatLong
            ? [value.coordinates[1], value.coordinates[0]]
            : value.coordinates
    }
}
