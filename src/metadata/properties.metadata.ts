import { ClassType, PropertyOptions } from '../interfaces'

export const PROPERTIES_KEY = Symbol('decoMongo:properties')

export class PropertyMetadata {
    constructor(readonly keyName: string | symbol, private readonly options: PropertyOptions) {}

    get mappedKeyName() {
        return this.options.name || this.keyName
    }

    get isTimestamp() {
        return this.options.timestamp ? true : false
    }

    get isCreateTimestamp() {
        return this.options.timestamp === 'create'
    }

    get isUpdateTimestamp() {
        return this.options.timestamp === 'update'
    }

    mapValueToDb(value: any) {
        return this.options.converter ? this.options.converter.toDb(value) : value
    }

    mapValueFromDb(mappedValue: any, targetType?: object) {
        return this.options.converter
            ? this.options.converter.fromDb(mappedValue, targetType)
            : mappedValue
    }
}

export class PropertiesMetadata {
    private readonly keyMap = new Map<string | symbol, PropertyMetadata>()
    private readonly reverseKeyMap = new Map<string | symbol, PropertyMetadata>()
    private readonly createTimestamps: PropertyMetadata[] = []
    private readonly updateTimestamps: PropertyMetadata[] = []

    set(keyName: string | symbol, options: PropertyOptions) {
        if (this.keyMap.has(keyName)) {
            throw new Error(`'${String(keyName)}' has more than one @Property() decorator.`)
        }

        const mappedKeyName = options.name || keyName

        if (this.reverseKeyMap.has(mappedKeyName)) {
            throw new Error(
                `Multiple properties are mapped to the name '${String(mappedKeyName)}'.  ` +
                    `Check @Property() definitions.`
            )
        }

        const property = new PropertyMetadata(keyName, options)
        this.keyMap.set(keyName, property)
        this.reverseKeyMap.set(mappedKeyName, property)

        if (options.timestamp === 'create') {
            this.createTimestamps.push(property)
        } else if (options.timestamp === 'update') {
            this.updateTimestamps.push(property)
        }
    }

    has(keyName: string | symbol) {
        return this.keyMap.has(keyName)
    }

    hasMappedKey(mappedKey: string | symbol) {
        return this.reverseKeyMap.has(mappedKey)
    }

    get(keyName: string | symbol) {
        const propertyMetadata = this.keyMap.get(keyName)

        if (!propertyMetadata) {
            throw new Error(`Invalid key name '${String(keyName)}'`)
        }

        return propertyMetadata
    }

    getFromMappedKey(mappedKey: string | symbol) {
        return this.reverseKeyMap.get(mappedKey)
    }

    all() {
        return this.keyMap.values()
    }

    withTimestamp() {
        return [...this.createTimestamps, ...this.updateTimestamps]
    }

    withCreateTimestamp() {
        return this.createTimestamps
    }

    withUpdateTimestamp() {
        return this.updateTimestamps
    }
}

export function getPropertiesMetadata<TDocument>(classType: ClassType<TDocument>) {
    return Reflect.getMetadata(PROPERTIES_KEY, classType) as PropertiesMetadata | undefined
}
