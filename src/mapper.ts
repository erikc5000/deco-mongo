import { ClassType } from './interfaces'
import { getPropertiesMetadata, PropertiesMetadata } from './metadata/properties-metadata'
import 'reflect-metadata'

export interface MapForUpdateOptions {
    upsert?: boolean
}

export interface UpdateOperation {
    $set?: object
    $setOnInsert?: object
    $unset?: object
}

export class Mapper<TInterface, TDocument extends object> {
    constructor(private readonly classType: ClassType<TDocument>) {}

    mapForInsert(document: TDocument) {
        const properties = this.getPropertiesMetadata()
        const mappedObject: any = {}

        for (const key of properties.allKeys) {
            const property = properties.get(key)

            if (!property.isTimestamp) {
                const value = (document as any)[key]
                mappedObject[property.mappedKeyName] = property.getMappedValue(value)
            }
        }

        return Mapper.populateTimestamps(mappedObject, 'create', properties)
    }

    mapForUpdate(document: TDocument, options?: MapForUpdateOptions): UpdateOperation {
        const properties = this.getPropertiesMetadata()

        let set: any
        let setOnInsert: any
        let unset: any

        for (const key of properties.allKeys) {
            const property = properties.get(key)

            // Ignore any attempt to change the '_id' field
            if (property.mappedKeyName === '_id') {
                continue
            }

            if (!property.isTimestamp) {
                const value = (document as any)[key]

                if (typeof value === 'undefined') {
                    if (unset == null) unset = {}
                    unset[property.mappedKeyName] = ''
                } else {
                    if (set == null) set = {}
                    set[property.mappedKeyName] = property.getMappedValue(value)
                }
            }
        }

        // Populate timestamps
        const upsert = (options && options.upsert) || false
        const timestampKeys = upsert ? properties.allTimestampKeys : properties.updateTimestampKeys

        if (timestampKeys.length) {
            const timestamp = new Date()

            for (const key of timestampKeys) {
                const property = properties.get(key)
                const mappedKey = property.mappedKeyName

                if (property.isCreationTimestamp) {
                    if (setOnInsert == null) setOnInsert = {}
                    setOnInsert[mappedKey]
                } else {
                    if (set == null) set = {}
                    set[mappedKey] = timestamp
                }
            }
        }

        return { $set: set, $setOnInsert: setOnInsert, $unset: unset }
    }

    mapPartialToDb(obj: Partial<TInterface>) {
        const properties = this.getPropertiesMetadata()
        const mappedObject: any = {}

        // tslint:disable-next-line:forin
        for (const key in obj) {
            const property = properties.get(key)
            const value = obj[key]
            mappedObject[property.mappedKeyName] = property.getMappedValue(value)
        }

        return mappedObject
    }

    mapFromResult(mappedObject: any): TDocument {
        const properties = this.getPropertiesMetadata()
        const obj = new this.classType()

        for (const key of properties.allKeys) {
            const property = properties.get(key)
            const mappedKey = property.mappedKeyName

            if (mappedKey in mappedObject) {
                const designType = Reflect.getMetadata('design:type', this.classType, key) as object
                const value = property.getValueFromMappedValue(mappedObject[mappedKey], designType)

                if (value) {
                    ;(obj as any)[key] = value
                }
            }
        }

        return obj
    }

    mapPartialFromDb(mappedObject: any): Partial<TInterface> {
        const properties = this.getPropertiesMetadata()
        const obj: any = {}

        // tslint:disable-next-line:forin
        for (const mappedKey in mappedObject) {
            const key = properties.getKeyFromMappedKey(mappedKey)

            if (key) {
                const property = properties.get(key)
                const designType = Reflect.getMetadata('design:type', this.classType, key)
                const value = property.getValueFromMappedValue(mappedObject[mappedKey], designType)
                obj[key] = value
            }
        }

        return obj
    }

    mapManyFromDb(objects: any[]): TDocument[] {
        return objects.map(obj => this.mapFromResult(obj))
    }

    private getPropertiesMetadata() {
        const properties = getPropertiesMetadata(this.classType)

        if (!properties) {
            throw new Error('No properties have been defined.')
        }

        return properties
    }

    private static populateTimestamps(
        obj: any,
        type: 'create' | 'update',
        properties: PropertiesMetadata
    ) {
        const keys =
            type === 'create' ? properties.allTimestampKeys : properties.updateTimestampKeys

        if (keys.length) {
            const timestamp = new Date()

            for (const key of keys) {
                const mappedKey = properties.get(key).mappedKeyName
                obj[mappedKey] = timestamp
            }
        }

        return obj
    }
}
