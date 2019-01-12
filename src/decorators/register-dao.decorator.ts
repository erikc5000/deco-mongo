import { DaoFactory, DaoConstructor } from '../internal/dao-factory'
import { ClassType } from '../interfaces'

export function RegisterDao<T extends object>(constructor: ClassType<T>) {
    return (target: DaoConstructor<any, any>) => {
        DaoFactory.register(constructor, target)
    }
}
