import { PropertyConverter } from '../property-converter'
import { IPropertyConverter } from '../interfaces'

/**
 * A custom property converter is automatically instantiated whenever a non-class converter is
 * used, providing default behavior whenever toDb() or fromDb() are not explicitly specified.
 */
export class CustomPropertyConverter extends PropertyConverter {
    constructor(private readonly converter: IPropertyConverter) {
        super()
    }

    toDb(value: any): any {
        return this.converter.toDb ? this.converter.toDb(value) : value
    }

    fromDb(value: any, targetType?: any): any {
        return super.fromDb(
            this.converter.fromDb ? this.converter.fromDb(value, targetType) : value,
            targetType
        )
    }
}
