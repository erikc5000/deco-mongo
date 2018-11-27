import { getIndexesMetadata } from '../metadata/indexes-metadata';
import { NonIndexedDogDocument, DogDocument, CatDocument } from './data/test-data';

describe('Indexes Decorator', () => {
    it('should have metadata when provided with a non-empty array', () => {
        const metadata = getIndexesMetadata(DogDocument);
        expect(metadata).toBeDefined();
        expect(metadata).toHaveLength(1);
    });

    it('should still have metadata when provided with an empty array', () => {
        const metadata = getIndexesMetadata(NonIndexedDogDocument);
        expect(metadata).toBeDefined();
        expect(metadata).toHaveLength(0);
    });

    it('should not have metadata when the decorator is missing', () => {
        const metadata = getIndexesMetadata(CatDocument);
        expect(metadata).not.toBeDefined();
    });
});
