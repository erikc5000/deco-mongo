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
export class Mapper<T extends object> {
    private readonly properties: PropertiesMetadata

    constructor(private readonly classType: ClassType<T>, options: MapperOptions = {}) {
        const properties = getPropertiesMetadata(this.classType)

        if (!properties) {
            throw new Error(`No properties are defined on ${classType}.`)
        }

        this.properties = properties
        this.validateProperties(options)
    }

    mapForInsert(document: T): any
    mapForInsert(documents: T[]): any[]
    mapForInsert(document: T | T[]): any {
        if (Array.isArray(document)) {
            return document.map(element => this.mapForInsert(element))
        } else if (!(document instanceof this.classType)) {
            return Mapper.throwUnexpectedTypeError(document)
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

    mapForUpdate(document: T, options?: MapForUpdateOptions): UpdateOperation
    mapForUpdate(documents: T[], options?: MapForUpdateOptions): UpdateOperation[]
    mapForUpdate(document: T | T[], options?: MapForUpdateOptions): any {
        if (Array.isArray(document)) {
            return document.map(element => this.mapForUpdate(element), options)
        } else if (!(document instanceof this.classType)) {
            return Mapper.throwUnexpectedTypeError(document)
        }

        const updateOp: UpdateOperation = {}

        for (const property of this.properties.withoutTimestamp()) {
            // Ignore any attempt to change the ID field
            if (property.isId) {
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

    mapIdForFilter(id: any): any {
        const idProperty = this.properties.getId()

        if (!idProperty) {
            throw new Error(`No '_id' property exists on ${this.classType.name}.`)
        }

        const filter: any = {}
        filter[idProperty.mappedKeyName] = idProperty.toDb(id)
        return filter
    }

    mapPartialToDb(object: Partial<T>): any
    mapPartialToDb(objects: Partial<T>[]): any[]
    mapPartialToDb(object: Partial<T> | Partial<T>[]): any {
        if (Array.isArray(object)) {
            return object.map(element => this.mapPartialToDb(element))
        } else if (typeof object !== 'object') {
            return Mapper.throwUnexpectedTypeError(object)
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

    mapFromResults(mappedObjects: any[]): T[] {
        return mappedObjects.map(element => this.mapFromResult(element))
    }

    mapFromResult(mappedObject: any): T {
        if (typeof mappedObject !== 'object' || Array.isArray(mappedObject)) {
            return Mapper.throwUnexpectedTypeError(mappedObject)
        }

        const document = new this.classType()

        for (const property of this.properties.all()) {
            const mappedKey = property.mappedKeyName

            if (mappedKey in mappedObject) {
                const value = property.fromDb(mappedObject[mappedKey])

                if (value !== undefined) {
                    const anyDoc = document as any
                    anyDoc[property.keyName] = value
                }
            }
        }

        return document
    }

    mapPartialsFromDb(mappedObjects: any[]): Partial<T>[] {
        return mappedObjects.map(element => this.mapPartialFromDb(element))
    }

    mapPartialFromDb(mappedObject: any): Partial<T> {
        if (typeof mappedObject !== 'object' || Array.isArray(mappedObject)) {
            return Mapper.throwUnexpectedTypeError(mappedObject)
        }

        const properties = this.properties
        const object: any = {}

        // tslint:disable-next-line:forin
        for (const mappedKey in mappedObject) {
            const property = properties.getFromMappedKey(mappedKey)

            if (property) {
                const value = property.fromDb(mappedObject[mappedKey])
                object[property.keyName] = value
            }
        }

        return object
    }

    /**
     * Validate all property definitions on the class associated with this mapper.  If there are
     * any errors, an exception will be thrown, reporting each of them individually.
     * @param options Mapper options
     */
    private validateProperties(options: MapperOptions) {
        const errors: string[] = []

        if (!options.nested && !this.properties.hasId()) {
            errors.push(`No property is mapped to '_id'.`)
        }

        for (const property of this.properties.all()) {
            const result = property.validate()

            if (!result.valid) {
                errors.push(`${property.keyName}: ` + result.error)
            }
        }

        if (errors.length > 0) {
            const message =
                `Errors were found in the property mapping definitions for ` +
                `${this.classType.name}:\n` +
                errors.map(value => '  ● ' + value).join('\n')

            throw new Error(message)
        }
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

    private static throwUnexpectedTypeError(object: any): never {
        throw new Error(`Mapping object of unexpected type '${typeof object}'`)
    }
}
