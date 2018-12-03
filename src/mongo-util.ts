import * as mongo from 'mongodb'

export async function collectionExists(name: string, db: mongo.Db): Promise<boolean> {
    return await db.listCollections({ name }, { nameOnly: true }).hasNext()
}
