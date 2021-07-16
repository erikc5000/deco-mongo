import { getPropertiesMetadata } from '../internal/metadata/properties.metadata'
import { ObjectIdProperty } from './object-id-property.decorator'
import { ObjectId } from 'mongodb'

describe('ObjectId property decorator', () => {
    class DogDocument {
        @ObjectIdProperty({ name: '_id', autoGenerate: true })
        id1?: string

        @ObjectIdProperty({ autoGenerate: () => new ObjectId() })
        id2?: ObjectId

        @ObjectIdProperty({ autoGenerate: false })
        id3: string = ''

        @ObjectIdProperty()
        id4?: string
    }

    it('should generate property metadata', () => {
        const properties = getPropertiesMetadata(DogDocument)
        expect(properties!.withCreateTimestamp()).toHaveLength(0)
        expect(properties!.withUpdateTimestamp()).toHaveLength(0)
        expect(properties!.withTimestamp()).toHaveLength(0)
        expect(properties!.withoutTimestamp()).toHaveLength(4)

        const property = properties!.get('id1')
        expect(property.isId).toBeTruthy()
    })
})
