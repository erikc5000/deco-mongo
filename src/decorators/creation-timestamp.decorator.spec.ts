import { getPropertiesMetadata } from '../internal/metadata/properties.metadata'
import { CreationTimestamp } from './creation-timestamp.decorator'

describe('creation timestamp decorator', () => {
    class DogDocument {
        @CreationTimestamp()
        createdAt?: Date
    }

    it('should generate creation timestamp property metadata', () => {
        const properties = getPropertiesMetadata(DogDocument)
        expect(properties!.withCreateTimestamp()).toHaveLength(1)
        expect(properties!.withUpdateTimestamp()).toHaveLength(0)
        expect(properties!.withTimestamp()).toHaveLength(1)
        expect(properties!.withoutTimestamp()).toHaveLength(0)

        const property = properties!.get('createdAt')
        expect(property.isCreateTimestamp).toBeTruthy()
        expect(property.isUpdateTimestamp).toBeFalsy()
        expect(property.isTimestamp).toBeTruthy()
    })
})
