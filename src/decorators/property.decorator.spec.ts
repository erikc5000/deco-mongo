import {
    getPropertiesMetadata,
    PropertyMetadata,
    PropertiesMetadata
} from '../metadata/properties.metadata'
import { Property } from './property.decorator'
import { ObjectID } from 'bson'

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
            expect(properties!.has('_id')).toBeTruthy()
            expect(properties!.has('breed')).toBeTruthy()
            expect(properties!.hasMappedKey('_id')).toBeTruthy()
            expect(properties!.hasMappedKey('breed')).toBeTruthy()
            expect(properties!.withTimestamp()).toHaveLength(0)
            expect(properties!.withCreateTimestamp()).toHaveLength(0)
            expect(properties!.withUpdateTimestamp()).toHaveLength(0)

            let allProperties: PropertyMetadata[] = []
            for (const property of properties!.all()) allProperties = allProperties.concat(property)
            expect(allProperties).toHaveLength(2)
        })

        it.each([['breed'], ['_id']])(
            'should have property metadata for each decorated property',
            propertyName => {
                const properties = getPropertiesMetadata(BirdDocument)

                const property = properties!.get(propertyName)
                expect(property).toBeInstanceOf(PropertyMetadata)
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
            expect(properties!.has('id')).toBeTruthy()
            expect(properties!.has('_id')).toBeFalsy()
            expect(properties!.hasMappedKey('id')).toBeFalsy()
            expect(properties!.hasMappedKey('_id')).toBeTruthy()

            const property = properties!.get('id')
            expect(property).toBeInstanceOf(PropertyMetadata)
            expect(property).toEqual(properties!.getFromMappedKey('_id'))
            expect(property.keyName).toBe('id')
            expect(property.mappedKeyName).toBe('_id')
        })

        it('should support custom property conversion', () => {
            class DogDocument {
                @Property({ converter: { toDb: value => new ObjectID(), fromDb: value => value } })
                _id?: ObjectID
            }

            const properties = getPropertiesMetadata(DogDocument)
            const property = properties!.get('_id')
            const mappedValue = property.mapValueToDb(undefined)
            expect(mappedValue).toBeInstanceOf(ObjectID)
            expect(property.mapValueFromDb(mappedValue)).toBeInstanceOf(ObjectID)
        })

        it('should support specifying creation timestamps', () => {
            class DogDocument {
                @Property()
                _id?: ObjectID

                @Property({ timestamp: 'create' })
                createdAt?: Date
            }

            const properties = getPropertiesMetadata(DogDocument)
            expect(properties!.withCreateTimestamp()).toHaveLength(1)
            expect(properties!.withUpdateTimestamp()).toHaveLength(0)
            expect(properties!.withTimestamp()).toHaveLength(1)

            const property = properties!.get('createdAt')
            expect(property.isCreateTimestamp).toBeTruthy()
            expect(property.isUpdateTimestamp).toBeFalsy()
            expect(property.isTimestamp).toBeTruthy()
        })

        it('should support specifying update timestamps', () => {
            class DogDocument {
                @Property()
                _id?: ObjectID

                @Property({ timestamp: 'update' })
                updatedAt?: Date
            }

            const properties = getPropertiesMetadata(DogDocument)
            expect(properties!.withCreateTimestamp()).toHaveLength(0)
            expect(properties!.withUpdateTimestamp()).toHaveLength(1)
            expect(properties!.withTimestamp()).toHaveLength(1)

            const property = properties!.get('updatedAt')
            expect(property.isCreateTimestamp).toBeFalsy()
            expect(property.isUpdateTimestamp).toBeTruthy()
            expect(property.isTimestamp).toBeTruthy()
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
