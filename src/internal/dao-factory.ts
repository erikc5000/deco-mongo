import * as mongo from 'mongodb'
import { ClassType } from '../interfaces/index'
import { Dao } from '../dao'

export type DaoConstructor<TDocument extends object, TDao extends Dao<TDocument>> = new (
    classType: ClassType<TDocument>,
    collection: mongo.Collection
) => TDao

export class DaoFactory {
    private static daoMap = new Map<ClassType<any>, DaoConstructor<any, any>>()

    static register(classType: ClassType<any>, dao: DaoConstructor<any, any>) {
        DaoFactory.daoMap.set(classType, dao)
    }

    static create(classType: ClassType<any>, collection: mongo.Collection) {
        const dao = DaoFactory.daoMap.get(classType)

        if (!dao) {
            throw new Error(`No Dao class is registered for ${classType.name}.`)
        }

        return new dao(classType, collection)
    }
}
