import { PropertyConverter } from '../interfaces'
import { Int32 } from 'bson'

export class Int32Converter implements PropertyConverter {
    toDb(value: number) {
        return new Int32(value)
    }

    fromDb(value: Int32) {
        return value.valueOf()
    }
}
