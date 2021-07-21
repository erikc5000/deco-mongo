import * as mongo from 'mongodb'
import { ObjectIdProperty, Property } from './decorators'
import { Mapper } from './mapper'
import { SortHelper } from './query'

describe('sort helper', () => {
    class CatDocument {
        @ObjectIdProperty()
        _id?: string

        @Property({ name: 'mappedName' })
        name: string = ''
    }

    it('should return an empty sort when there are no properties', () => {
        const sortHelper = new SortHelper()
        const mapper = new Mapper(CatDocument)

        expect(sortHelper.getSortOption(mapper)).toEqual(new Map<string, mongo.SortDirection>())
    })

    it('should map sort properties to DB representation', () => {
        const sortHelper = new SortHelper<CatDocument>()
        const mapper = new Mapper(CatDocument)

        sortHelper.push('name', 1)

        const expected = new Map<string, mongo.SortDirection>()
        expected.set('mappedName', 1)

        expect(sortHelper.getSortOption(mapper)).toEqual(expected)
    })
})
