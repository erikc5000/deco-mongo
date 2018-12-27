import { ClassType } from './interfaces'
import { getPropertiesMetadata, PropertiesMetadata } from './internal/metadata/properties.metadata'
import 'reflect-metadata'
import { MappedProperty } from './internal/mapped-property'

export interface MapForUpdateOptions {
    upsert?: boolean
}

export interface UpdateOperation {
    $set?: any
    $setOnInsert?: any
    $unset?: any
}

export interface MapperOptions {
    nested?: boolean
}

/**
 * Map objects between their in-memory and database representations.
 */
export class Mapper<TDocument extends object> {
    private readonly properties: PropertiesMetadata

    constructor(private readonly classType: ClassType<TDocument>, options: MapperOptions = {}) {
        const properties = getPropertiesMetadata(this.classType)

        if (!properties) {
            throw new Error(`No properties are defined on ${classType}.`)
        } else if (!options.nested && !properties.hasMappedKey('_id')) {
            throw new Error(`${classType} has no property mapped to '_id'.`)
        }

        this.properties = properties
    }

    mapForInsert(document: TDocument): any
    mapForInsert(documents: TDocument[]): any[]
    mapForInsert(document: TDocument | TDocument[]): any {
        if (Array.isArray(document)) {
            return document.map(element => this.mapForInsert(element))
        } else if (!(document instanceof this.classType)) {
            return Mapper.unexpectedTypeError(document)
        }

        const mappedObject: any = {}

        for (const property of this.properties.withoutTimestamp()) {
            const value = (document as any)[property.keyName]
            const mappedValue = property.toDb(value)

            if (mappedValue !== undefined) {
                mappedObject[property.mappedKeyName] = mappedValue
            }
        }

        return this.populateTimestampsForInsert(mappedObject)
    }

    mapForUpdate(document: TDocument, options?: MapForUpdateOptions): UpdateOperation
    mapForUpdate(documents: TDocument[], options?: MapForUpdateOptions): UpdateOperation[]
    mapForUpdate(document: TDocument | TDocument[], options?: MapForUpdateOptions): any {
        if (Array.isArray(document)) {
            return document.map(element => this.mapForUpdate(element), options)
        } else if (!(document instanceof this.classType)) {
            return Mapper.unexpectedTypeError(document)
        }

        const updateOp: UpdateOperation = {}

        for (const property of this.properties.withoutTimestamp()) {
            // Ignore any attempt to change the '_id' field
            if (property.mappedKeyName === '_id') {
                continue
            }

            const value = (document as any)[property.keyName]

            if (value === undefined) {
                if (updateOp.$unset == null) updateOp.$unset = {}
                updateOp.$unset[property.mappedKeyName] = ''
            } else {
                if (updateOp.$set == null) updateOp.$set = {}
                updateOp.$set[property.mappedKeyName] = property.toDb(value)
            }
        }

        return this.populateTimestampsForUpdate(updateOp, options && options.upsert)
    }

    mapPartialToDb(object: Partial<TDocument>): any
    mapPartialToDb(objects: Partial<TDocument>[]): any[]
    mapPartialToDb(object: Partial<TDocument> | Partial<TDocument>[]): any {
        if (Array.isArray(object)) {
            return object.map(element => this.mapPartialToDb(element))
        } else if (typeof object !== 'object') {
            return Mapper.unexpectedTypeError(object)
        }

        const properties = this.properties
        const mappedObject: any = {}

        // tslint:disable-next-line:forin
        for (const key in object) {
            if (properties.hasKey(key)) {
                const property = properties.get(key)
                const value = object[key]
                mappedObject[property.mappedKeyName] = property.toDb(value)
            }
        }

        return mappedObject
    }

    mapFromResults(mappedObjects: any[]): TDocument[] {
        return mappedObjects.map(element => this.mapFromResult(element))
    }

    mapFromResult(mappedObject: any): TDocument {
        if (typeof mappedObject !== 'object' || Array.isArray(mappedObject)) {
            return Mapper.unexpectedTypeError(mappedObject)
        }

        const document = new this.classType()

        for (const property of this.properties.all()) {
            const mappedKey = property.mappedKeyName

            if (mappedKey in mappedObject) {
                const designType = Reflect.getMetadata(
                    'design:type',
                    this.classType.prototype,
                    property.keyName
                )

                const value = property.fromDb(mappedObject[mappedKey], designType)

                if (value !== undefined) {
                    const anyDoc = document as any
                    anyDoc[property.keyName] = value
                }
            }
        }

        return document
    }

    mapPartialsFromDb(mappedObjects: any[]): Partial<TDocument>[] {
        return mappedObjects.map(element => this.mapPartialFromDb(element))
    }

    mapPartialFromDb(mappedObject: any): Partial<TDocument> {
        if (typeof mappedObject !== 'object' || Array.isArray(mappedObject)) {
            return Mapper.unexpectedTypeError(mappedObject)
        }

        const properties = this.properties
        const object: any = {}

        // tslint:disable-next-line:forin
        for (const mappedKey in mappedObject) {
            const property = properties.getFromMappedKey(mappedKey)

            if (property) {
                const designType = Reflect.getMetadata(
                    'design:type',
                    this.classType.prototype,
                    property.keyName
                )

                const value = property.fromDb(mappedObject[mappedKey], designType)
                object[property.keyName] = value
            }
        }

        return object
    }

    private populateTimestampsForInsert(mappedObject: any) {
        const timestampProperties = this.properties.withTimestamp()

        if (timestampProperties.length > 0) {
            const timestamp = new Date()

            for (const property of timestampProperties) {
                mappedObject[property.mappedKeyName] = timestamp
            }
        }

        return mappedObject
    }

    private populateTimestampsForUpdate(updateOp: UpdateOperation, upsert?: boolean) {
        const timestampProperties = upsert
            ? this.properties.withTimestamp()
            : this.properties.withUpdateTimestamp()

        if (timestampProperties.length > 0) {
            const timestamp = new Date()

            for (const property of timestampProperties) {
                const mappedKey = property.mappedKeyName

                if (property.isCreateTimestamp) {
                    if (updateOp.$setOnInsert == null) updateOp.$setOnInsert = {}
                    updateOp.$setOnInsert[mappedKey] = timestamp
                } else {
                    if (updateOp.$set == null) updateOp.$set = {}
                    updateOp.$set[mappedKey] = timestamp
                }
            }
        }

        return updateOp
    }

    private static unexpectedTypeError(object: any): never {
        throw new Error(`Mapping object of unexpected type '${typeof object}'`)
    }
}
