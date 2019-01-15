import * as mongo from 'mongodb'
import { ClassType } from './interfaces'
import { MappedCollection } from './mapped-collection'
import { Mapper } from './mapper'

export interface ReplaceOptions {
    upsert?: boolean
}

export class Dao<T extends object> {
    protected readonly collection: MappedCollection<T>

    constructor(classType: ClassType<T>, collection: mongo.Collection) {
        this.collection = new MappedCollection(new Mapper(classType), collection)
    }

    async insert(document: T): Promise<T>
    async insert(documents: T[]): Promise<T[]>
    async insert(document: T | T[]): Promise<T | T[]> {
        if (Array.isArray(document)) {
            return await this.collection.insertMany(document)
        }

        return await this.collection.insertOne(document)
    }

    async replace(id: any, newContent: T, options: ReplaceOptions = {}) {
        return await this.collection.findByIdAndUpdate(id, newContent, {
            upsert: options.upsert,
            returnOriginal: false
        })
    }

    async delete(id: any) {
        return await this.collection.deleteById(id)
    }

    async findById(id: any) {
        return await this.collection.findById(id)
    }
}
