import { GeospatialQuery } from './geospatial.query'
import { KeyOf, GeoJsonPolygon, GeoJsonMultiPolygon } from '../interfaces'

/**
 * Find documents with a location property that intersects a given area
 */
export class GeoIntersectsQuery<T extends object> extends GeospatialQuery<T> {
    constructor(propertyName: KeyOf<T>, geometry: GeoJsonPolygon | GeoJsonMultiPolygon) {
        super(propertyName, '$geoIntersects', geometry)
    }
}
