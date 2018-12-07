import { PropertyConverter } from '../interfaces'
import { Double } from 'bson'

export class DoubleConverter implements PropertyConverter {
    toDb(value: number) {
        return new Double(value)
    }

    fromDb(value: Double) {
        return value.valueOf()
    }
}
