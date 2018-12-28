import { getPropertiesMetadata } from '../internal/metadata/properties.metadata'
import { UuidProperty } from './uuid-property.decorator'
import uuid = require('uuid')

describe('UUID property decorator', () => {
    class DogDocument {
        @UuidProperty({ name: '_id', autoGenerate: 'v1' })
        id1?: string

        @UuidProperty({ autoGenerate: 'v4' })
        id2?: Buffer

        @UuidProperty({ autoGenerate: () => uuid.v1() })
        id3: string = ''

        @UuidProperty({ autoGenerate: false })
        id4?: string

        @UuidProperty()
        id5?: string
    }

    it('should generate property metadata', () => {
        const properties = getPropertiesMetadata(DogDocument)
        expect(properties!.withCreateTimestamp()).toHaveLength(0)
        expect(properties!.withUpdateTimestamp()).toHaveLength(0)
        expect(properties!.withTimestamp()).toHaveLength(0)
        expect(properties!.withoutTimestamp()).toHaveLength(5)

        const property = properties!.get('id1')
        expect(property.isId).toBeTruthy()
    })
})
