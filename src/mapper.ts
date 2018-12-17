import { ClassType } from './interfaces'
import { getPropertiesMetadata, PropertiesMetadata } from './metadata/properties-metadata'
import 'reflect-metadata'

export interface MapForInsertOptions {
    timestamps?: 'create' | 'update'
}

export interface MapForUpdateOptions {
    populateCreationTimestamp?: boolean
}

export interface UpdateOperation {
    $set?: object
    $unset?: object
    $currentDate?: object
}

export class Mapper<TInterface, TDocument extends object> {
    constructor(private readonly classType: ClassType<TDocument>) {}

    mapForInsert(document: TDocument, options?: MapForInsertOptions) {
        const properties = this.getPropertiesMetadata()
        const mappedObject: any = {}

        for (const key of properties.allKeys) {
            const property = properties.get(key)
            const value = (document as any)[key]
            mappedObject[property.mappedKeyName] = property.getMappedValue(value)
        }

        // TODO: Add support for local-generated timestamps as option
        // if (options && options.timestamps) {
        //     return this.addTimestamps(mappedObject, options.timestamps, properties)
        // } else {
        //     return mappedObject
        // }
        return mappedObject
    }

    mapForUpdate(document: TDocument, options?: MapForUpdateOptions): UpdateOperation {
        const populateCreationTimestamp = (options && options.populateCreationTimestamp) || false
        const properties = this.getPropertiesMetadata()

        let set: any
        let unset: any
        let currentDate: any

        for (const key of properties.allKeys) {
            const property = properties.get(key)

            // Ignore any attempt to change the '_id' field
            if (property.mappedKeyName === '_id') {
                continue
            }

            if (property.isTimestamp) {
                if (
                    (property.isCreationTimestamp && populateCreationTimestamp) ||
                    property.isUpdateTimestamp
                ) {
                    if (!currentDate) currentDate = {}
                    currentDate[property.mappedKeyName] = true
                }
            } else {
                const value = (document as any)[key]

                if (typeof value === 'undefined') {
                    if (!unset) unset = {}
                    unset[property.mappedKeyName] = ''
                } else {
                    if (!set) set = {}
                    set[property.mappedKeyName] = property.getMappedValue(value)
                }
            }
        }

        return { $set: set, $unset: unset, $currentDate: currentDate }
    }

    mapPartialToDb(obj: Partial<TInterface>, options?: MapForInsertOptions) {
        const properties = this.getPropertiesMetadata()
        const mappedObject: any = {}

        // tslint:disable-next-line:forin
        for (const key in obj) {
            // const type = Reflect.getMetadata('design:type', classType, key);
            const property = properties.get(key)
            const value = obj[key]
            mappedObject[property.mappedKeyName] = property.getMappedValue(value)
        }

        // if (options && options.timestamps) {
        //     return this.addTimestamps(mappedObject, options.timestamps, properties)
        // } else {
        //     return mappedObject
        // }
        return mappedObject
    }

    mapManyForInsert(objects: TDocument[], options?: MapForInsertOptions) {
        return objects.map(obj => this.mapForInsert(obj, options))
    }

    mapManyForUpdate(objects: TDocument[], options?: MapForUpdateOptions) {
        return objects.map(obj => this.mapForUpdate(obj, options))
    }

    mapPartialsToDb(objects: Partial<TInterface>[], options?: MapForInsertOptions) {
        return objects.map(obj => this.mapPartialToDb(obj, options))
    }

    mapFromDb(mappedObject: any): TDocument {
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
                ;(obj as any)[key] = value
            }
        }

        return obj
    }

    mapManyFromDb(objects: any[]): TDocument[] {
        return objects.map(obj => this.mapFromDb(obj))
    }

    mapPartialsFromDb(objects: any[]): Partial<TInterface>[] {
        return objects.map(obj => this.mapPartialFromDb(obj))
    }

    private getPropertiesMetadata() {
        const properties = getPropertiesMetadata(this.classType)

        if (!properties) {
            throw new Error('No properties have been defined.')
        }

        return properties
    }

    // private addTimestamps(obj: any, type: 'create' | 'update', properties: PropertiesMetadata) {
    //     const keys =
    //         type === 'create' ? properties.allTimestampKeys : properties.updateTimestampKeys

    //     if (keys.length) {
    //         const timestamp = new Date()

    //         for (const key of keys) {
    //             const mappedKey = properties.get(key).mappedKeyName
    //             obj[mappedKey] = timestamp
    //         }
    //     }

    //     // Make sure that creation timestamps can't be overwritten during an update
    //     if (type === 'update') {
    //         for (const key of properties.createTimestampKeys) {
    //             const mappedKey = properties.get(key).mappedKeyName
    //             delete obj[mappedKey]
    //         }
    //     }

    //     return obj
    // }
}
