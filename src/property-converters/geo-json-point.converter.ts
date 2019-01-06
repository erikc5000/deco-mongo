import { PropertyConverter } from '../property-converter'
import { CoordType, GeoJsonPoint } from '../interfaces'
import {
    isCoordinates,
    isGeoJsonPoint,
    coordinatesToLongLat,
    reverseCoordinates
} from '../internal/geospatial-util'

export interface GeoJsonPointConverterOptions {
    coordType: CoordType
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
        if (value === undefined) {
            return undefined
        } else if (!isCoordinates(value)) {
            throw new Error(`Expected an array containing '[number, number]'`)
        }

        const location: GeoJsonPoint = {
            coordinates: coordinatesToLongLat(value, this.options.coordType),
            type: 'Point'
        }

        return location
    }

    fromDb(value: any, targetType?: any) {
        if (value === undefined) {
            return undefined
        } else if (!isGeoJsonPoint(value)) {
            throw new Error('Expected a GeoJSON Point')
        }

        if (targetType !== Array) {
            throw new Error(`Incompatible target type '${targetType}'`)
        }

        return this.options.coordType === CoordType.LatLong
            ? reverseCoordinates(value.coordinates)
            : value.coordinates
    }

    getSupportedTypes() {
        return [Array]
    }
}
