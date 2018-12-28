import { PropertyConverter } from '../property-converter'
import { IPropertyConverter } from '../interfaces/index'

/**
 * A custom property converter is automatically instantiated whenever a non-class converter is
 * used, providing default behavior whenever toDb() or fromDb() are not explicitly specified.
 */
export class CustomConverter extends PropertyConverter {
    constructor(private readonly converter: IPropertyConverter) {
        super()
    }

    toDb(value: any): any {
        if (this.converter.toDb) {
            return this.converter.toDb(value)
        }

        return value
    }

    fromDb(value: any, targetType?: any): any {
        if (this.converter.fromDb) {
            return this.converter.fromDb(value, targetType)
        }

        return value
    }
}
