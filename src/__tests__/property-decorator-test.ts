import { getPropertyMetadata } from '../metadata/property-metadata';
import { BirdDocument } from './data/test-data';

describe('Property Decorator', () => {
    it('should have property metadata when defined on a property', () => {
        const metadata = getPropertyMetadata(BirdDocument, 'color');
        expect(metadata).toBeDefined();
        expect(metadata!.name).toBe('mappedColor');
        expect(metadata!.converter).toBeDefined();
    });

    // it('should allow a JSON schema object to be provided as an option', () => {
    //     const metadata = getCollectionMetadata(SchemaCatDocument);
    //     expect(metadata).toBeDefined();
    //     expect(metadata.name).toBe('schemaCats');
    //     expect(metadata.options).toEqual({ jsonSchema: catSchema });
    // });
});
