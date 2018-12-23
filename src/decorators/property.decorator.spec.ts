import { getPropertiesMetadata, PropertiesMetadata } from '../internal/metadata/properties.metadata'
import { Property } from './property.decorator'
import { ObjectID } from 'bson'
import { MappedProperty } from '../internal/mapped-property'
import { PropertyConverter } from '../property-converter'

describe('property decorator', () => {
    describe('class with decorated properties', () => {
        class BirdDocument {
            @Property()
            _id = new ObjectID()

            @Property()
            breed?: string
        }

        it('should have class-level properties metadata', () => {
            const properties = getPropertiesMetadata(BirdDocument)
            expect(properties).toBeInstanceOf(PropertiesMetadata)
            expect(properties!.hasKey('_id')).toBeTruthy()
            expect(properties!.hasKey('breed')).toBeTruthy()
            expect(properties!.hasMappedKey('_id')).toBeTruthy()
            expect(properties!.hasMappedKey('breed')).toBeTruthy()
            expect(properties!.withTimestamp()).toHaveLength(0)
            expect(properties!.withCreateTimestamp()).toHaveLength(0)
            expect(properties!.withUpdateTimestamp()).toHaveLength(0)
            expect(properties!.withoutTimestamp()).toHaveLength(2)

            let allProperties: MappedProperty[] = []
            for (const property of properties!.all()) allProperties = allProperties.concat(property)
            expect(allProperties).toHaveLength(2)
        })

        it.each([['breed'], ['_id']])(
            'should have property metadata for each decorated property',
            propertyName => {
                const properties = getPropertiesMetadata(BirdDocument)

                const property = properties!.get(propertyName)
                expect(property).toBeInstanceOf(MappedProperty)
                expect(property).toEqual(properties!.getFromMappedKey(propertyName))
                expect(property.keyName).toBe(propertyName)
                expect(property.mappedKeyName).toBe(propertyName)
                expect(property.isCreateTimestamp).toBeFalsy()
                expect(property.isUpdateTimestamp).toBeFalsy()
                expect(property.isTimestamp).toBeFalsy()
            }
        )

        it('should support property renaming', () => {
            class DogDocument {
                @Property({ name: '_id' })
                id = new ObjectID()
            }

            const properties = getPropertiesMetadata(DogDocument)
            expect(properties!.hasKey('id')).toBeTruthy()
            expect(properties!.hasKey('_id')).toBeFalsy()
            expect(properties!.hasMappedKey('id')).toBeFalsy()
            expect(properties!.hasMappedKey('_id')).toBeTruthy()

            const property = properties!.get('id')
            expect(property).toBeInstanceOf(MappedProperty)
            expect(property).toEqual(properties!.getFromMappedKey('_id'))
            expect(property.keyName).toBe('id')
            expect(property.mappedKeyName).toBe('_id')
        })

        it('should support inline property conversion', () => {
            class DogDocument {
                @Property({ converter: { toDb: value => new ObjectID() } })
                _id?: ObjectID
            }

            const properties = getPropertiesMetadata(DogDocument)
            const property = properties!.get('_id')
            const mappedValue = property.toDb(undefined)
            expect(mappedValue).toBeInstanceOf(ObjectID)
            expect(property.fromDb(mappedValue)).toBeInstanceOf(ObjectID)
        })

        it('should support class-based property conversion', () => {
            class TestPropertyConverter extends PropertyConverter {
                toDb(value: any) {
                    return new ObjectID()
                }
            }
            class DogDocument {
                @Property({ converter: new TestPropertyConverter() })
                _id?: ObjectID
            }

            const properties = getPropertiesMetadata(DogDocument)
            const property = properties!.get('_id')
            const mappedValue = property.toDb(undefined)
            expect(mappedValue).toBeInstanceOf(ObjectID)
            expect(property.fromDb(mappedValue)).toBeInstanceOf(ObjectID)
        })

        it(`throws an exception when accessing a property that doesn't exist`, () => {
            expect(() => getPropertiesMetadata(BirdDocument)!.get('color')).toThrow(Error)
        })
    })

    describe('class with multiple decorators on the same property', () => {
        it('throws an exception when the second decorator is processed', () => {
            expect(() => {
                class BirdDocument {
                    @Property()
                    _id = new ObjectID()

                    @Property()
                    @Property()
                    breed?: string
                }
            }).toThrow(Error)
        })
    })

    describe('class with multiple decorators mapped to the same property name', () => {
        it('throws an exception when the second decorator is processed', () => {
            expect(() => {
                class BirdDocument {
                    @Property()
                    _id = new ObjectID()

                    @Property()
                    newBreed?: string

                    @Property({ name: 'newBreed' })
                    breed?: string
                }
            }).toThrow(Error)
        })
    })

    describe('class with no decorated properties', () => {
        class UndecoratedBird {
            color?: string
        }

        it('should have no metadata', () => {
            expect(getPropertiesMetadata(UndecoratedBird)).toBeUndefined()
        })
    })
})
