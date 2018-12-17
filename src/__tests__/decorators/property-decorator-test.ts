import { getPropertiesMetadata, PropertyMetadata } from '../../metadata/properties-metadata'
import { BirdDocument } from '../data/test-data'

describe('Property Decorator', () => {
    it('should create metadata when defined on a property', () => {
        const propertiesMetadata = getPropertiesMetadata(BirdDocument)
        expect(propertiesMetadata).toBeDefined()
        expect(propertiesMetadata!.allKeys).toContain('color')
        expect(propertiesMetadata!.has('color')).toBeTruthy()
        expect(propertiesMetadata!.getKeyFromMappedKey('mappedColor')).toBe('color')

        const propertyMetadata = propertiesMetadata!.get('color')
        expect(propertyMetadata).toBeInstanceOf(PropertyMetadata)
        expect(propertyMetadata.keyName).toBe('color')
        expect(propertyMetadata.mappedKeyName).toBe('mappedColor')
    })

    // it('should allow a JSON schema object to be provided as an option', () => {
    //     const metadata = getCollectionMetadata(SchemaCatDocument);
    //     expect(metadata).toBeDefined();
    //     expect(metadata.name).toBe('schemaCats');
    //     expect(metadata.options).toEqual({ jsonSchema: catSchema });
    // });
})
