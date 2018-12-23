import { PropertyConverter } from '../property-converter'

interface GeoJsonLocation {
    coordinates: [number, number]
    type: string
}

type Coordinates = [number, number]

export const enum CoordType {
    LatLong,
    LongLat
}

export interface GeoJsonPointConverterOptions {
    coordType: CoordType
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

/**
 * Convert a latitude/longitude or longitude/latitude array to a GeoJSON Point
 */
export class GeoJsonPointConverter extends PropertyConverter {
    constructor(
        private readonly options: GeoJsonPointConverterOptions = { coordType: CoordType.LatLong }
    ) {
        super()
    }

    toDb(value: any) {
        if (value == null) {
            return value
        } else if (!isCoordinates(value)) {
            throw new Error(`Expected an array containing '[number, number]'`)
        }

        const location: GeoJsonLocation = {
            coordinates:
                this.options.coordType === CoordType.LatLong
                    ? [value[1], value[0]]
                    : [value[0], value[1]],
            type: 'Point'
        }

        return location
    }

    fromDb(value: any, targetType?: any): Coordinates {
        if (value == null) {
            return value
        } else if (!isGeoJsonLocation(value)) {
            throw new Error('Expected a valid GeoJSON location')
        }

        if (targetType !== Array) {
            throw new Error(`Incompatible target type '${targetType}'`)
        }

        return this.options.coordType === CoordType.LatLong
            ? [value.coordinates[1], value.coordinates[0]]
            : value.coordinates
    }

    get supportedTypes() {
        return [Array]
    }
}
