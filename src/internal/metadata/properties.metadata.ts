import { PropertyMetadata } from './property.metadata'
import { ClassType } from '../../interfaces'

export const PROPERTIES_KEY = Symbol('decoMongo:properties')

export class PropertiesMetadata {
    private readonly keyMap = new Map<string, PropertyMetadata>()
    private readonly reverseKeyMap = new Map<string, PropertyMetadata>()
    private readonly allProperties: PropertyMetadata[] = []
    private readonly nonTimestamps: PropertyMetadata[] = []
    private readonly createTimestamps: PropertyMetadata[] = []
    private readonly updateTimestamps: PropertyMetadata[] = []
    readonly parent?: PropertiesMetadata

    constructor(classType: ClassType<any>) {
        const parentClass = Object.getPrototypeOf(classType.prototype.constructor)

        if (parentClass.prototype !== undefined) {
            this.parent = getPropertiesMetadata(parentClass)

            if (this.parent) {
                this.parent.all().forEach(property => this.push(property))
            }
        }
    }

    push(property: PropertyMetadata) {
        if (this.keyMap.has(property.keyName)) {
            throw new Error(`'${property.keyName}' has more than one @Property() decorator.`)
        }

        if (this.reverseKeyMap.has(property.mappedKeyName)) {
            throw new Error(
                `Multiple properties are mapped to the name ` +
                    `'${property.mappedKeyName}'.  Check @Property() definitions.`
            )
        }

        this.keyMap.set(property.keyName, property)
        this.reverseKeyMap.set(property.mappedKeyName, property)
        this.allProperties.push(property)

        if (property.isCreateTimestamp) {
            this.createTimestamps.push(property)
        } else if (property.isUpdateTimestamp) {
            this.updateTimestamps.push(property)
        } else {
            this.nonTimestamps.push(property)
        }
    }

    hasId() {
        return this.hasMappedKey('_id')
    }

    getId() {
        return this.getFromMappedKey('_id')
    }

    hasKey(keyName: string) {
        return this.keyMap.has(keyName)
    }

    hasMappedKey(mappedKey: string) {
        return this.reverseKeyMap.has(mappedKey)
    }

    get(keyName: string) {
        const property = this.keyMap.get(keyName)

        if (!property) {
            throw new Error(`Invalid key name '${keyName}'`)
        }

        return property
    }

    getFromMappedKey(mappedKey: string) {
        return this.reverseKeyMap.get(mappedKey)
    }

    all() {
        return this.allProperties
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

export function getPropertiesMetadata<T extends object>(classType: ClassType<T>) {
    return Reflect.getOwnMetadata(PROPERTIES_KEY, classType) as PropertiesMetadata | undefined
}
