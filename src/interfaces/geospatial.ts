export type Coordinates = [number, number]

export const enum CoordType {
    LatLong,
    LongLat
}

export interface MongoCrs {
    type: 'name'
    properties: { name: 'urn:x-mongodb:crs:strictwinding:EPSG:4326' }
}

export interface GeoJsonPoint {
    coordinates: Coordinates
    type: 'Point'
}

export interface GeoJsonPolygon {
    coordinates: Coordinates[][]
    type: 'Polygon'
    crs?: MongoCrs
}

export interface GeoJsonMultiPolygon {
    coordinates: Coordinates[][][]
    type: 'MultiPolygon'
    crs?: MongoCrs
}

export type GeoJsonGeometry = GeoJsonPoint | GeoJsonPolygon | GeoJsonMultiPolygon
