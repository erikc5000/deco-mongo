import { Mapper } from './mapper'
import {
    Property,
    CreationTimestamp,
    UpdateTimestamp,
    IntProperty,
    DoubleProperty
} from './decorators'
import { ObjectIdProperty } from './decorators/object-id-property.decorator'
import { ObjectID } from 'bson'

describe('mapper', () => {
    describe('constructor', () => {
        describe('when no properties are defined on the provided class', () => {
            class CatDocument {
                _id?: string
            }

            it('throws an exception', () => {
                expect(() => new Mapper(CatDocument)).toThrow(Error)
            })
        })

        describe('when no _id property is defined on the provided class', () => {
            class CatDocument {
                @Property()
                name?: string
            }

            it('throws an exception when not mapping a nested document', () => {
                expect(() => new Mapper(CatDocument)).toThrow(Error)
            })

            it('raises no error when mapping a nested document', () => {
                expect(() => new Mapper(CatDocument, { nested: true })).not.toThrow()
            })
        })

        describe('when properties have unsupported converters', () => {
            class CatDocument {
                @ObjectIdProperty()
                _id?: number

                @IntProperty()
                age: boolean = false

                @DoubleProperty()
                rating = 9.0
            }

            it('throws an exception', () => {
                expect(() => new Mapper(CatDocument)).toThrow(Error)
            })
        })
    })

    describe('map for insert', () => {
        describe('with a class that has no timestamps', () => {
            class CatDocument {
                @ObjectIdProperty({ name: '_id', autoGenerate: true })
                id?: ObjectID

                @Property({ name: 'catName' })
                name: string = 'I have a name'

                @Property()
                age?: number | null
            }

            let mapper: Mapper<CatDocument>

            beforeEach(() => {
                mapper = new Mapper(CatDocument)
            })

            it('maps single documents', () => {
                const document = new CatDocument()
                const mappedDoc = mapper.mapForInsert(document)

                expect(typeof mappedDoc).toBe('object')
                expect(Array.isArray(mappedDoc)).toBeFalsy()
                expect(mappedDoc._id).toBeInstanceOf(ObjectID)
                expect(mappedDoc.catName).toBe('I have a name')
                expect(Object.keys(mappedDoc).sort()).toEqual(['_id', 'catName'])
            })

            it('maps empty arrays of documents', () => {
                const mappedDocs = mapper.mapForInsert([])
                expect(mappedDocs).toEqual([])
            })

            it('maps non-empty arrays of documents', () => {
                const doc1 = new CatDocument()
                const doc2 = new CatDocument()
                doc2.name = 'different name'
                doc2.age = 7
                const doc3 = new CatDocument()
                doc3.age = null

                const mappedDocs = mapper.mapForInsert([doc1, doc2, doc3])
                expect(Array.isArray(mappedDocs)).toBeTruthy()
                expect(mappedDocs).toHaveLength(3)

                expect(mappedDocs[0]._id).toBeInstanceOf(ObjectID)
                expect(mappedDocs[0].catName).toBe('I have a name')
                expect(Object.keys(mappedDocs[0]).sort()).toEqual(['_id', 'catName'])

                expect(mappedDocs[1]._id).toBeInstanceOf(ObjectID)
                expect(mappedDocs[1].catName).toBe('different name')
                expect(mappedDocs[1].age).toBe(7)
                expect(Object.keys(mappedDocs[1]).sort()).toEqual(['_id', 'age', 'catName'])

                expect(mappedDocs[2]._id).toBeInstanceOf(ObjectID)
                expect(mappedDocs[2].catName).toBe('I have a name')
                expect(mappedDocs[2].age).toBeNull()
                expect(Object.keys(mappedDocs[2]).sort()).toEqual(['_id', 'age', 'catName'])
            })
        })

        describe('with a class that has timestamps', () => {
            class CatDocument {
                @ObjectIdProperty({ name: '_id', autoGenerate: true })
                id?: string

                @Property({ name: 'catName' })
                name: string = 'I have a name'

                @CreationTimestamp()
                createdAt?: Date

                @UpdateTimestamp()
                updatedAt?: Date
            }

            let mapper: Mapper<CatDocument>

            beforeEach(() => {
                mapper = new Mapper(CatDocument)
            })

            it('maps single documents', () => {
                const document = new CatDocument()
                const mappedDoc = mapper.mapForInsert(document)

                expect(typeof mappedDoc).toBe('object')
                expect(Array.isArray(mappedDoc)).toBeFalsy()
                expect(mappedDoc._id).toBeInstanceOf(ObjectID)
                expect(mappedDoc.catName).toBe('I have a name')
                expect(mappedDoc.createdAt).toBeInstanceOf(Date)
                expect(mappedDoc.updatedAt).toBeInstanceOf(Date)
                expect(mappedDoc.createdAt.getTime()).toEqual(mappedDoc.updatedAt.getTime())
                expect(Object.keys(mappedDoc).sort()).toEqual([
                    '_id',
                    'catName',
                    'createdAt',
                    'updatedAt'
                ])
            })

            it('maps empty arrays of documents', () => {
                const mappedDocs = mapper.mapForInsert([])
                expect(mappedDocs).toEqual([])
            })

            it('maps non-empty arrays of documents', () => {
                const doc1 = new CatDocument()
                const doc2 = new CatDocument()
                doc2.name = 'different name'

                const mappedDocs = mapper.mapForInsert([doc1, doc2])
                expect(Array.isArray(mappedDocs)).toBeTruthy()
                expect(mappedDocs).toHaveLength(2)

                expect(mappedDocs[0]._id).toBeInstanceOf(ObjectID)
                expect(mappedDocs[0].catName).toBe('I have a name')
                expect(mappedDocs[0].createdAt).toBeInstanceOf(Date)
                expect(mappedDocs[0].updatedAt).toBeInstanceOf(Date)
                expect(mappedDocs[0].createdAt.getTime()).toEqual(mappedDocs[0].updatedAt.getTime())
                expect(Object.keys(mappedDocs[0]).sort()).toEqual([
                    '_id',
                    'catName',
                    'createdAt',
                    'updatedAt'
                ])

                expect(mappedDocs[1]._id).toBeInstanceOf(ObjectID)
                expect(mappedDocs[1].catName).toBe('different name')
                expect(mappedDocs[1].createdAt).toBeInstanceOf(Date)
                expect(mappedDocs[1].updatedAt).toBeInstanceOf(Date)
                expect(mappedDocs[1].createdAt.getTime()).toEqual(mappedDocs[1].updatedAt.getTime())
                expect(Object.keys(mappedDocs[1]).sort()).toEqual([
                    '_id',
                    'catName',
                    'createdAt',
                    'updatedAt'
                ])
            })
        })
    })

    describe('map for update', () => {
        const objectId = new ObjectID()

        describe('with a class that has no timestamps', () => {
            class CatDocument {
                @ObjectIdProperty({ name: '_id' })
                id: string = objectId.toHexString() // Same ID for all objects to make testing easier

                @Property({ name: 'catName' })
                name: string = 'I have a name'

                @Property()
                age?: number | null
            }

            let mapper: Mapper<CatDocument>

            beforeEach(() => {
                mapper = new Mapper(CatDocument)
            })

            it('maps single documents', () => {
                const document = new CatDocument()
                const mappedDoc = mapper.mapForUpdate(document)

                expect(mappedDoc).toStrictEqual({
                    $set: { catName: 'I have a name' },
                    $unset: { age: '' }
                })
            })

            it('maps empty arrays of documents', () => {
                const mappedDocs = mapper.mapForUpdate([])
                expect(mappedDocs).toEqual([])
            })

            it('maps non-empty arrays of documents', () => {
                const doc1 = new CatDocument()
                const doc2 = new CatDocument()
                doc2.name = 'different name'
                doc2.age = 7
                const doc3 = new CatDocument()
                doc3.age = null

                const mappedDocs = mapper.mapForUpdate([doc1, doc2, doc3])
                expect(Array.isArray(mappedDocs)).toBeTruthy()
                expect(mappedDocs).toHaveLength(3)

                expect(mappedDocs[0]).toStrictEqual({
                    $set: { catName: 'I have a name' },
                    $unset: { age: '' }
                })

                expect(mappedDocs[1]).toStrictEqual({
                    $set: { catName: 'different name', age: 7 }
                })

                expect(mappedDocs[2]).toStrictEqual({
                    $set: { catName: 'I have a name', age: null }
                })
            })
        })

        describe('with a class that has timestamps', () => {
            class CatDocument {
                @ObjectIdProperty({ name: '_id' })
                id: string = objectId.toHexString() // Same ID for all objects to make testing easier

                @Property({ name: 'catName' })
                name: string = 'I have a name'

                @CreationTimestamp()
                createdAt?: Date

                @UpdateTimestamp()
                updatedAt?: Date
            }

            let mapper: Mapper<CatDocument>

            beforeEach(() => {
                mapper = new Mapper(CatDocument)
            })

            it('maps single documents', () => {
                const document = new CatDocument()
                const mappedDoc = mapper.mapForUpdate(document)

                expect(typeof mappedDoc).toBe('object')
                expect(Array.isArray(mappedDoc)).toBeFalsy()
                expect(mappedDoc.$set.catName).toBe('I have a name')
                expect(mappedDoc.$set.updatedAt).toBeInstanceOf(Date)
                expect(Object.keys(mappedDoc.$set).sort()).toEqual(['catName', 'updatedAt'])
                expect(mappedDoc.$unset).toBeUndefined()
                expect(mappedDoc.$setOnInsert).toBeUndefined()
            })

            it('maps empty arrays of documents', () => {
                const mappedDocs = mapper.mapForInsert([])
                expect(mappedDocs).toEqual([])
            })

            it('maps non-empty arrays of documents', () => {
                const doc1 = new CatDocument()
                const doc2 = new CatDocument()
                doc2.name = 'different name'
                doc2.createdAt = new Date()

                const mappedDocs = mapper.mapForUpdate([doc1, doc2])
                expect(Array.isArray(mappedDocs)).toBeTruthy()
                expect(mappedDocs).toHaveLength(2)

                expect(mappedDocs[0].$set.catName).toBe('I have a name')
                expect(mappedDocs[0].$set.updatedAt).toBeInstanceOf(Date)
                expect(Object.keys(mappedDocs[0].$set).sort()).toEqual(['catName', 'updatedAt'])
                expect(mappedDocs[0].$unset).toBeUndefined()
                expect(mappedDocs[0].$setOnInsert).toBeUndefined()

                expect(mappedDocs[1].$set.catName).toBe('different name')
                expect(mappedDocs[1].$set.updatedAt).toBeInstanceOf(Date)
                expect(Object.keys(mappedDocs[1].$set).sort()).toEqual(['catName', 'updatedAt'])
                expect(mappedDocs[1].$unset).toBeUndefined()
                expect(mappedDocs[1].$setOnInsert).toBeUndefined()
            })
        })
    })

    describe('map ID to DB', () => {
        const objectId = new ObjectID()
        const stringId = objectId.toHexString()

        it('returns an object containing just the mapped ID field', () => {
            class CatDocument {
                @ObjectIdProperty({ name: '_id' })
                id: string = stringId

                @Property()
                name?: string
            }

            const mapper = new Mapper(CatDocument)
            expect(mapper.mapIdToDb(stringId)).toStrictEqual({ _id: new ObjectID(stringId) })
        })

        it('throws an exception if no _id property exists', () => {
            class DogDocument {
                @Property()
                name?: string
            }

            const mapper = new Mapper(DogDocument, { nested: true })
            expect(() => mapper.mapIdToDb(stringId)).toThrow(Error)
        })
    })

    describe('map from result', () => {
        const objectId = new ObjectID()
        const modifiedDate = new Date()

        class CatDocument {
            @ObjectIdProperty({ name: '_id' })
            id: string = objectId.toHexString()

            @Property({ name: 'catName' })
            name: string = 'I have a name'

            @Property()
            color: string = 'black'

            @Property()
            age?: number | null

            @Property()
            likesPizza?: boolean

            @UpdateTimestamp()
            lastModified?: Date
        }

        let mapper: Mapper<CatDocument>

        beforeEach(() => {
            mapper = new Mapper(CatDocument)
        })

        it('maps valid documents', () => {
            const result = {
                _id: objectId,
                catName: 'I have another name',
                age: null,
                likesPizza: false,
                lastModified: modifiedDate
            }
            const mappedDoc = mapper.mapFromResult(result)

            const expected = new CatDocument()
            expected.id = objectId.toHexString()
            expected.name = 'I have another name'
            expected.age = null
            expected.color = 'black'
            expected.likesPizza = false
            expected.lastModified = modifiedDate

            expect(mappedDoc).toStrictEqual(expected)
        })

        it('throws an exception when given an array', () => {
            expect(() => mapper.mapFromResult([])).toThrow(Error)
        })

        it.each([false, 47, 'a string'])(
            'throws an exception when given a non-object value (%p)',
            value => {
                expect(() => mapper.mapFromResult(value)).toThrow(Error)
            }
        )
    })
})
