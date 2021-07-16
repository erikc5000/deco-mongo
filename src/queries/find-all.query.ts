import * as mongo from 'mongodb'
import { PaginatedQuery } from './paginated.query'

export class FindAllQuery<T extends object> extends PaginatedQuery<T> {
    protected getFilter(): mongo.Filter<any> {
        return {}
    }
}
