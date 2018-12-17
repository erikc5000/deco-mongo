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

    get isCreationTimestamp() {
        return this.options.timestamp === 'create'
    }

    get isUpdateTimestamp() {
        return this.options.timestamp === 'update'
    }

    getMappedValue(value: any) {
        return this.options.converter ? this.options.converter.toDb(value) : value
    }

    getValueFromMappedValue(mappedValue: any, targetType?: object) {
        return this.options.converter
            ? this.options.converter.fromDb(mappedValue, targetType)
            : mappedValue
    }
}

export class PropertiesMetadata {
    private readonly keyMap = new Map<string | symbol, PropertyMetadata>()
    private readonly reverseKeyMap = new Map<string | symbol, string | symbol>()
    private readonly createTimestampList: (string | symbol)[] = []
    private readonly updateTimestampList: (string | symbol)[] = []

    set(keyName: string | symbol, options: PropertyOptions) {
        this.keyMap.set(keyName, new PropertyMetadata(keyName, options))

        const mappedKeyName = options.name || keyName

        if (this.reverseKeyMap.has(mappedKeyName)) {
            throw new Error(
                `Detected multiple properties mapped to the name '${String(mappedKeyName)}'.  ` +
                    `Check @Property() definitions.`
            )
        }

        this.reverseKeyMap.set(mappedKeyName, keyName)

        if (options.timestamp === 'create') {
            this.createTimestampList.push(keyName)
        } else if (options.timestamp === 'update') {
            this.updateTimestampList.push(keyName)
        }
    }

    has(keyName: string | symbol) {
        return this.keyMap.get(keyName) ? true : false
    }

    get(keyName: string | symbol) {
        const propertyMetadata = this.keyMap.get(keyName)

        if (!propertyMetadata) {
            throw new Error(`Invalid key '${String(keyName)}'`)
        }

        return propertyMetadata
    }

    getKeyFromMappedKey(mappedKey: string | symbol) {
        return this.reverseKeyMap.get(mappedKey)
    }

    get allKeys() {
        return this.keyMap.keys()
    }

    get allTimestampKeys() {
        return [...this.createTimestampList, ...this.updateTimestampList]
    }

    get createTimestampKeys() {
        return this.createTimestampList
    }

    get updateTimestampKeys() {
        return this.updateTimestampList
    }
}

export function getPropertiesMetadata<TDocument>(classType: ClassType<TDocument>) {
    return Reflect.getMetadata(PROPERTIES_KEY, classType) as PropertiesMetadata | undefined
}
