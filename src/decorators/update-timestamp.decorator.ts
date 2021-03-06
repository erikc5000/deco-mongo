import { TimestampPropertyOptions, TimestampType } from '../interfaces'
import { Property } from './property.decorator'

/**
 * Indicates that this property is a timestamp, which should be populated automatically whenever a
 * document in the database is modified.  If using a converter, bear in mind that the
 * toDb() function will not be called and the DB represention will always be a Date object.
 * However, it is possible to convert the Date object to a different class type via the fromDb()
 * function.
 * @param options Options that control how the property is mapped
 */
export function UpdateTimestamp(options?: TimestampPropertyOptions) {
    return Property({ timestamp: TimestampType.Update, ...options })
}
