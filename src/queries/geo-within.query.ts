import { GeospatialQuery } from './geospatial.query'
import { GeoJsonPolygon, GeoJsonMultiPolygon, KeyOf } from '../interfaces'

/**
 * Find documents with a location property that sits within a provided geographical area.
 */
export class GeoWithinQuery<T extends object> extends GeospatialQuery<T> {
    constructor(propertyName: KeyOf<T>, geometry: GeoJsonPolygon | GeoJsonMultiPolygon) {
        super(propertyName, '$geoWithin', geometry)
    }
}
