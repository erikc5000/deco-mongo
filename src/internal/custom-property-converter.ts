import { PropertyConverter } from '../property-converter'
import { IPropertyConverter } from '../interfaces'

export class CustomPropertyConverter extends PropertyConverter {
    constructor(private readonly converter: IPropertyConverter) {
        super()
    }

    toDb(value: any): any {
        if (this.converter.toDb) {
            return this.converter.toDb(value)
        }

        return super.toDb(value)
    }

    fromDb(value: any, targetType?: any): any {
        if (this.converter.fromDb) {
            return this.converter.fromDb(value, targetType)
        }

        return super.fromDb(value, targetType)
    }
}
