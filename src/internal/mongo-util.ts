import * as mongo from 'mongodb'

export async function collectionExists(name: string, db: mongo.Db): Promise<boolean> {
    return await db.listCollections({ name }, { nameOnly: true }).hasNext()
}

export function isIndexOptionsConflictError(err: any) {
    return err instanceof mongo.MongoError && err.code === 85
}

export interface DuplicateKeyInfo {
    collection?: string
    index?: string
    duplicateKey?: string
}

export function isDuplicateKeyError(err: any) {
    return err instanceof mongo.MongoError && err.code === 11000
}

export function parseDuplicateKeyError(err: mongo.MongoError): DuplicateKeyInfo {
    // "E11000 duplicate key error collection: tms-dev.gyms index: name_1_locationName_1 dup key: { : "Rock Spot Climbing", : "South Boston" }"
    if (err.errmsg) {
        const components = err.errmsg.match(/.* collection: (.+) index: (.+) dup key: (.+)/)

        if (components && components.length === 4) {
            return { collection: components[1], index: components[2], duplicateKey: components[3] }
        }
    }

    return {}
}
