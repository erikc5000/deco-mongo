import { getPropertiesMetadata } from '../internal/metadata/properties.metadata'
import { NestedProperty } from './nested-property.decorator'
import { Property } from './property.decorator'

describe('nested property decorator', () => {
    class CatDocument {
        @Property()
        breed?: string
    }

    class DogDocument {
        @NestedProperty(CatDocument)
        enemy?: CatDocument
    }

    it('should generate property metadata', () => {
        const properties = getPropertiesMetadata(DogDocument)
        expect(properties!.all()).toHaveLength(1)
        expect(properties!.withCreateTimestamp()).toHaveLength(0)
        expect(properties!.withUpdateTimestamp()).toHaveLength(0)
        expect(properties!.withTimestamp()).toHaveLength(0)
        expect(properties!.withoutTimestamp()).toHaveLength(1)
        expect(properties!.hasKey('enemy')).toBeTruthy()
        expect(properties!.get('enemy')).toBeDefined()
    })
})
