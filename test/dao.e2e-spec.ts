import { MongoMemoryServer } from 'mongodb-memory-server'
import * as mongo from 'mongodb'
import {
    DecoMongo,
    Collection,
    ObjectIdProperty,
    Property,
    UpdateTimestamp,
    Index,
    CreationTimestamp,
    Dao
} from '../src'

describe('Dao (e2e)', () => {
    let mongod: MongoMemoryServer
    let client: mongo.MongoClient
    let db: mongo.Db
    let collection: mongo.Collection
    let dao: Dao<Cat, string>

    @Collection('cats', { autoCreateIndexes: 'ifNewCollection' })
    @Index({ name: 1 }, { unique: true })
    class Cat {
        @ObjectIdProperty({ name: '_id', autoGenerate: true })
        id?: string

        @Property()
        name: string = ''

        @Property()
        eyeColor: string = ''

        @CreationTimestamp()
        createdAt?: Date

        @UpdateTimestamp()
        updatedAt?: Date
    }

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create()
        const uri = mongod.getUri()
        client = await mongo.MongoClient.connect(uri)
        db = client.db(mongod.instanceInfo!!.dbName)
    }, 100000)

    afterAll(async () => {
        if (client) await client.close()
        if (mongod) await mongod.stop()
    })

    beforeEach(async () => {
        collection = await DecoMongo.initializeCollection(Cat, db)
        dao = new Dao(Cat, collection)
    })

    afterEach(async () => {
        await db.dropCollection('cats')
    })

    describe('insert', () => {
        it(`should insert single documents`, async () => {
            const cat = new Cat()
            cat.name = 'Charles'

            const result = await dao.insert(cat)
            expect(result).toBeInstanceOf(Cat)
            expect(mongo.ObjectId.isValid(result.id!)).toBeTruthy()
            expect(result.name).toBe('Charles')
            expect(result.eyeColor).toBe('')
            expect(result.createdAt).toBeDefined()
            expect(result.updatedAt).toBeDefined()
            expect(result.createdAt!.getTime()).toEqual(result.updatedAt!.getTime())

            const foundInDb = await collection.find().toArray()
            expect(foundInDb).toHaveLength(1)
        })

        it(`should insert multiple documents`, async () => {
            const cat1 = new Cat()
            cat1.name = 'Charles'

            const cat2 = new Cat()
            cat2.name = 'Florence'

            const results = await dao.insert([cat1, cat2])
            expect(Array.isArray(results)).toBeTruthy()
            expect(results).toHaveLength(2)

            for (const result of results) {
                expect(mongo.ObjectId.isValid(result.id!)).toBeTruthy()
                expect(result.eyeColor).toBe('')
                expect(result.createdAt).toBeDefined()
                expect(result.updatedAt).toBeDefined()
                expect(result.createdAt!.getTime()).toEqual(result.updatedAt!.getTime())
            }

            expect(results[0].name).toBe('Charles')
            expect(results[1].name).toBe('Florence')

            const foundInDb = await collection.find().toArray()
            expect(foundInDb).toHaveLength(2)
        })

        it(`throws an exception when inserting documents with duplicate IDs`, async () => {
            const id = new mongo.ObjectId().toHexString()

            const cat1 = new Cat()
            cat1.id = id
            cat1.name = 'Charles'
            await dao.insert(cat1)

            const cat2 = new Cat()
            cat2.id = id
            cat2.name = 'Florence'
            await expect(dao.insert(cat2)).rejects.toBeInstanceOf(mongo.MongoError)

            expect(await collection.countDocuments()).toEqual(1)
        })

        it(`throws an exception when inserting documents with the same name`, async () => {
            const cat1 = new Cat()
            cat1.name = 'Charles'
            await dao.insert(cat1)

            const cat2 = new Cat()
            cat2.name = 'Charles'
            await expect(dao.insert(cat2)).rejects.toBeInstanceOf(mongo.MongoError)

            expect(await collection.countDocuments()).toEqual(1)
        })
    })
})
