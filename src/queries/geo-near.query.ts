import { GeospatialQuery } from './geospatial.query'
import { GeoJsonPoint, KeyOf } from '../interfaces'

/**
 * Find documents near a geographical location, taking into account the earth's curvature
 */
export class GeoNearQuery<T extends object> extends GeospatialQuery<T> {
    private $minDistance?: number
    private $maxDistance?: number

    constructor(propertyName: KeyOf<T>, geometry: GeoJsonPoint) {
        super(propertyName, '$near', geometry)
    }

    /**
     * Return only results at least this far away.
     * @param minDistance The minimum distance in meters
     */
    minDistance(minDistance: number) {
        this.$minDistance = minDistance
        return this
    }

    /**
     * Return only results within this radius.
     * @param maxDistance The maximum distance in meters
     */
    maxDistance(maxDistance: number) {
        this.$maxDistance = maxDistance
        return this
    }

    /**
     * Add min and max distance to the geospatial search operation
     */
    protected populateOperation(): any {
        const operation = super.populateOperation()

        if (this.$minDistance != null) {
            operation.$minDistance = this.$minDistance
        }

        if (this.$maxDistance != null) {
            operation.$maxDistance = this.$maxDistance
        }

        return operation
    }
}
