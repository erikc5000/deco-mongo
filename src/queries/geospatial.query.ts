import * as mongo from 'mongodb'
import { KeyOf, GeoJsonGeometry } from '../interfaces'
import { Mapper } from '../mapper'
import { PaginatedQuery } from './paginated.query'

export type GeospatialQueryOperator = '$near' | '$nearSphere' | '$geoWithin' | '$geoIntersects'

/**
 * Base class for non-legacy geospatial queries
 */
export abstract class GeospatialQuery<T extends object> extends PaginatedQuery<T> {
    constructor(
        private readonly propertyName: KeyOf<T>,
        private readonly operator: GeospatialQueryOperator,
        private readonly geometry: GeoJsonGeometry
    ) {
        super()
    }

    protected getFilter(mapper: Mapper<T>): mongo.FilterQuery<any> {
        const mappedProperty = mapper.mapPropertyNameToDb(this.propertyName)
        const filter: mongo.FilterQuery<any> = {}
        filter[mappedProperty] = {}
        filter[mappedProperty][this.operator] = this.populateOperation()
        return filter
    }

    /**
     * Populate the geospatial search operation
     */
    protected populateOperation(): any {
        return { $geometry: this.geometry }
    }
}
