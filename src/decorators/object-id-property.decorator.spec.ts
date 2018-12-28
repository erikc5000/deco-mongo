import { getPropertiesMetadata } from '../internal/metadata/properties.metadata'
import { ObjectIdProperty } from './object-id-property.decorator'
import { ObjectID } from 'bson'

describe('ObjectID property decorator', () => {
    class DogDocument {
        @ObjectIdProperty({ name: '_id', autoGenerate: true })
        id1?: string

        @ObjectIdProperty({ autoGenerate: () => new ObjectID() })
        id2?: ObjectID

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
