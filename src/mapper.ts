import { ClassType } from './interfaces'
import { getPropertiesMetadata, PropertiesMetadata } from './internal/metadata/properties.metadata'
import 'reflect-metadata'

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
export class Mapper<TInterface, TDocument extends object> {
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

    mapForInsert(document: TDocument) {
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

    mapForUpdate(document: TDocument, options?: MapForUpdateOptions): UpdateOperation {
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

    mapPartialToDb(obj: Partial<TInterface>) {
        const properties = this.properties
        const mappedObject: any = {}

        // tslint:disable-next-line:forin
        for (const key in obj) {
            const property = properties.get(key)
            const value = obj[key]
            mappedObject[property.mappedKeyName] = property.toDb(value)
        }

        return mappedObject
    }

    mapFromResult(mappedObject: any): TDocument {
        const properties = this.properties
        const obj = new this.classType()

        for (const property of properties.all()) {
            const mappedKey = property.mappedKeyName

            if (mappedKey in mappedObject) {
                const designType = Reflect.getMetadata(
                    'design:type',
                    this.classType.prototype,
                    property.keyName
                )

                const value = property.fromDb(mappedObject[mappedKey], designType)

                if (value) {
                    ;(obj as any)[property.keyName] = value
                }
            }
        }

        return obj
    }

    mapPartialFromDb(mappedObject: any): Partial<TInterface> {
        const properties = this.properties
        const obj: any = {}

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
                obj[property.keyName] = value
            }
        }

        return obj
    }

    mapManyFromDb(objects: any[]): TDocument[] {
        return objects.map(obj => this.mapFromResult(obj))
    }

    private populateTimestampsForInsert(obj: any) {
        const timestampProperties = this.properties.withTimestamp()

        if (timestampProperties.length) {
            const timestamp = new Date()

            for (const property of timestampProperties) {
                obj[property.mappedKeyName] = timestamp
            }
        }

        return obj
    }

    private populateTimestampsForUpdate(updateOp: UpdateOperation, upsert?: boolean) {
        const timestampProperties = upsert
            ? this.properties.withTimestamp()
            : this.properties.withUpdateTimestamp()

        if (timestampProperties.length) {
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
}
