import { ClassType } from './interfaces'
import { getPropertyMetadata, getClassPropertiesMetadata } from './metadata/property-metadata'

export interface MapToDbOptions {
    timestamps?: 'create' | 'update'
}

export class Mapper<TInterface, TDocument extends object> {
    constructor(private readonly classType: ClassType<TDocument>) {}

    mapObjectToDb(obj: TInterface, options?: MapToDbOptions) {
        const mappedObject: any = {}

        // tslint:disable-next-line:forin
        for (const key in obj) {
            // const type = Reflect.getMetadata('design:type', classType, key);
            const propertyOptions = getPropertyMetadata(this.classType, key)

            let mappedKey: string = key
            let value: any = obj[key]

            if (propertyOptions) {
                if (propertyOptions.name) mappedKey = propertyOptions.name
                if (propertyOptions.converter) value = propertyOptions.converter.toDb(value)
            }

            if (mappedKey in mappedObject) {
                throw new Error(
                    `Detected multiple properties mapped to the name '${mappedKey}' ` +
                        `on ${this.classType}.  Check @Property() definitions.`
                )
            } else {
                mappedObject[mappedKey] = value
            }
        }

        if (options && options.timestamps) {
            return this.addTimestamps(mappedObject, options.timestamps)
        } else {
            return mappedObject
        }
    }

    mapObjectsToDb(objects: TInterface[], options?: MapToDbOptions) {
        return objects.map(obj => this.mapObjectToDb(obj, options))
    }

    mapObjectFromDb(mappedObject: any): Partial<TInterface> {
        const classPropertiesMetadata = getClassPropertiesMetadata(this.classType)

        if (!classPropertiesMetadata) {
            throw new Error('No properties defined')
        }

        const obj: any = {}

        // tslint:disable-next-line:forin
        for (const mappedKey in mappedObject) {
            const key = classPropertiesMetadata.getKeyFromMappedKey(mappedKey) || mappedKey

            if (key in obj) {
                throw new Error(
                    `Detected multiple properties mapped to the name '${String(key)}' ` +
                        `on ${this.classType}.  Check @Property() definitions.`
                )
            }

            const propertyOptions = getPropertyMetadata(this.classType, key)

            let value: any = mappedObject[mappedKey]

            if (propertyOptions && propertyOptions.converter)
                value = propertyOptions.converter.fromDb(value)

            obj[key] = value
        }

        return obj as Partial<TInterface>
    }

    mapObjectsFromDb(objects: any[]): Partial<TInterface>[] {
        return objects.map(obj => this.mapObjectFromDb(obj))
    }

    private addTimestamps(obj: any, type: 'create' | 'update') {
        const classPropertiesMetadata = getClassPropertiesMetadata(this.classType)

        if (classPropertiesMetadata) {
            const keys =
                type === 'create'
                    ? classPropertiesMetadata.allTimestampKeys
                    : classPropertiesMetadata.updateTimestampKeys

            if (keys.length) {
                const timestamp = new Date()

                for (const key of keys) {
                    const propertyOptions = getPropertyMetadata(this.classType, key)

                    const mappedKey =
                        propertyOptions && propertyOptions.name ? propertyOptions.name : key

                    obj[mappedKey] = timestamp
                }
            }
        }

        return obj
    }
}
