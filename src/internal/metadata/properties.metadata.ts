import { MappedProperty } from '../mapped-property'
import { ClassType } from '../../interfaces'

export const PROPERTIES_KEY = Symbol('decoMongo:properties')

export class PropertiesMetadata {
    private readonly keyMap = new Map<string | symbol, MappedProperty>()
    private readonly reverseKeyMap = new Map<string | symbol, MappedProperty>()
    private readonly nonTimestamps: MappedProperty[] = []
    private readonly createTimestamps: MappedProperty[] = []
    private readonly updateTimestamps: MappedProperty[] = []

    push(property: MappedProperty) {
        if (this.keyMap.has(property.keyName)) {
            throw new Error(
                `'${String(property.keyName)}' has more than one @Property() decorator.`
            )
        }

        if (this.reverseKeyMap.has(property.mappedKeyName)) {
            throw new Error(
                `Multiple properties are mapped to the name ` +
                    `'${String(property.mappedKeyName)}'.  Check @Property() definitions.`
            )
        }

        this.keyMap.set(property.keyName, property)
        this.reverseKeyMap.set(property.mappedKeyName, property)

        if (property.isCreateTimestamp) {
            this.createTimestamps.push(property)
        } else if (property.isUpdateTimestamp) {
            this.updateTimestamps.push(property)
        } else {
            this.nonTimestamps.push(property)
        }
    }

    hasKey(keyName: string | symbol) {
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

    withoutTimestamp() {
        return this.nonTimestamps
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
