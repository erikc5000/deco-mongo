import { TimestampPropertyOptions, TimestampType } from '../interfaces'
import { Property } from './property.decorator'

/**
 * Indicates that this property is a timestamp, which should be populated automatically when a
 * document is first inserted into the database.  If using a converter, bear in mind that the
 * toDb() function will not be called and the DB represention will always be a Date object.
 * However, it is possible to convert the Date object to a different class type via the fromDb()
 * function.
 * @param options Options that control how the property is mapped
 */
export function CreationTimestamp(options?: TimestampPropertyOptions) {
    return Property({ timestamp: TimestampType.Create, ...options })
}
