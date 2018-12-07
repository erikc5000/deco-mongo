import { ClassType } from './interfaces'
import { getPropertyMetadata, getClassPropertiesMetadata } from './metadata/property-metadata'

export class Mapper<TInterface, TDocument extends object> {
    constructor(private readonly obj: any, private readonly classType: ClassType<TDocument>) {}

    withCreationTimestamps() {
        const creationTime = Date.now()
        // this.obj.
        return this
    }

    withUpdateTimestamps() {
        const updateTime = Date.now()

        return this
    }

    get toDb(): any {
        if (this.obj instanceof Array) {
            return mapObjectsToDatabase(this.obj, this.classType)
        } else if (typeof this.obj === 'object') {
            return mapObjectToDatabase(this.obj, this.classType)
        } else {
            throw new Error(`Mapping unexpected type '${typeof this.obj}'`)
        }
    }

    get fromDb(): Partial<TInterface> | Partial<TInterface>[] {
        if (this.obj instanceof Array) {
            return mapObjectsFromDatabase(this.obj, this.classType)
        } else if (typeof this.obj === 'object') {
            return mapObjectFromDatabase(this.obj, this.classType)
        } else {
            throw new Error(`Mapping unexpected type '${typeof this.obj}'`)
        }
    }
}

export class MultiMapper<TInterface, TDocument extends object> {

}

export function mapObjectToDatabase<TInterface, TDocument extends object>(
    obj: TInterface,
    classType: ClassType<TDocument>
) {
    const mappedObject: any = {}

    // tslint:disable-next-line:forin
    for (const key in obj) {
        // const type = Reflect.getMetadata('design:type', classType, key);
        const propertyOptions = getPropertyMetadata(classType, key)

        let mappedKey: string = key
        let value: any = obj[key]

        if (propertyOptions) {
            if (propertyOptions.name) mappedKey = propertyOptions.name
            if (propertyOptions.converter) value = propertyOptions.converter.toDb(value)
        }

        if (mappedKey in mappedObject) {
            throw new Error(
                `Detected multiple properties mapped to the name '${mappedKey}' ` +
                    `on ${classType}.  Check @Property() definitions.`
            )
        } else {
            mappedObject[mappedKey] = value
        }
    }

    return mappedObject
}

export function mapPartialObjectToDatabase<TInterface, TDocument extends object>(
    obj: TInterface,
    classType: ClassType<TDocument>
) {
    const mappedObject: any = {}

    // tslint:disable-next-line:forin
    for (const key in obj) {
        // const type = Reflect.getMetadata('design:type', classType, key);
        const propertyOptions = getPropertyMetadata(classType, key)

        let mappedKey: string = key
        let value: any = obj[key]

        if (propertyOptions) {
            if (propertyOptions.name) mappedKey = propertyOptions.name
            if (propertyOptions.converter) value = propertyOptions.converter.toDb(value)
        }

        if (mappedKey in mappedObject) {
            throw new Error(
                `Detected multiple properties mapped to the name '${mappedKey}' ` +
                    `on ${classType}.  Check @Property() definitions.`
            )
        } else {
            mappedObject[mappedKey] = value
        }
    }

    return mappedObject
}

export function mapObjectsToDatabase<TInterface, TDocument extends object>(
    objects: TInterface[],
    classType: ClassType<TDocument>
) {
    const mappedObjects = []

    for (const obj of objects) {
        mappedObjects.push(mapObjectToDatabase(obj, classType))
    }

    return mappedObjects
}

export function mapObjectFromDatabase<TInterface, TDocument extends object>(
    mappedObject: any,
    classType: ClassType<TDocument>
): Partial<TInterface> {
    const classPropertiesMetadata = getClassPropertiesMetadata(classType)

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
                    `on ${classType}.  Check @Property() definitions.`
            )
        }

        const propertyOptions = getPropertyMetadata(classType, key)

        let value: any = mappedObject[mappedKey]

        if (propertyOptions && propertyOptions.converter)
            value = propertyOptions.converter.fromDb(value)

        obj[key] = value
    }

    return obj as Partial<TInterface>
}

export function mapObjectsFromDatabase<TInterface, TDocument extends object>(
    objects: any[],
    classType: ClassType<TDocument>
) {
    const mappedObjects: Partial<TInterface>[] = []

    for (const obj of objects) {
        mappedObjects.push(mapObjectFromDatabase(obj, classType))
    }

    return mappedObjects
}
