import { getPropertiesMetadata } from '../internal/metadata/properties.metadata'
import { UpdateTimestamp } from './update-timestamp.decorator'

describe('update timestamp decorator', () => {
    class DogDocument {
        @UpdateTimestamp()
        updatedAt?: Date
    }

    it('should generate update timestamp property metadata', () => {
        const properties = getPropertiesMetadata(DogDocument)
        expect(properties!.withCreateTimestamp()).toHaveLength(0)
        expect(properties!.withUpdateTimestamp()).toHaveLength(1)
        expect(properties!.withTimestamp()).toHaveLength(1)
        expect(properties!.withoutTimestamp()).toHaveLength(0)

        const property = properties!.get('updatedAt')
        expect(property.isCreateTimestamp).toBeFalsy()
        expect(property.isUpdateTimestamp).toBeTruthy()
        expect(property.isTimestamp).toBeTruthy()
    })
})
