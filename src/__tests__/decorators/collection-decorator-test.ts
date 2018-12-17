import { getCollectionMetadata } from '../../metadata/collection-metadata'
import { CatDocument, SchemaCatDocument, catSchema } from '../data/test-data'

describe('Collection Decorator', () => {
    it('should have collection metadata', () => {
        const metadata = getCollectionMetadata(CatDocument)
        expect(metadata).toBeDefined()
        expect(metadata.name).toBe('cats')
        expect(metadata.options).toBeUndefined()
    })

    it('should allow a JSON schema object to be provided as an option', () => {
        const metadata = getCollectionMetadata(SchemaCatDocument)
        expect(metadata).toBeDefined()
        expect(metadata.name).toBe('schemaCats')
        expect(metadata.options).toEqual({ jsonSchema: catSchema })
    })
})
