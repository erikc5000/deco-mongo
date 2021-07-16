import { Binary } from 'mongodb'
import { PropertyConverter } from '../property-converter'
import * as uuid from 'uuid'

function isBinary(value: any): value is Binary {
    return typeof value === 'object' && value.buffer && value.sub_type
}

export interface UuidConverterOptions {
    /** Generate a new UUID when converting an empty value to the database. */
    autoGenerate?: false | 'v1' | 'v4' | (() => string | Buffer)
}

/**
 * Convert a UUID in string or Buffer form into a BSON Binary object
 */
export class UuidConverter extends PropertyConverter {
    constructor(private readonly options: UuidConverterOptions = {}) {
        super()
    }

    toDb(value: any) {
        switch (typeof value) {
            case 'undefined':
                return this.maybeAutoGenerate()

            case 'string':
                if (value.length === 0) {
                    const autoGenValue = this.maybeAutoGenerate()

                    if (!autoGenValue) {
                        throw new Error('Expected a valid UUID string')
                    }

                    return autoGenValue
                }

                return UuidConverter.createBinaryFromString(value)

            case 'object':
                if (value instanceof Buffer) {
                    return UuidConverter.createBinaryFromBuffer(value)
                } else if (value instanceof Binary) {
                    if (value.sub_type !== Binary.SUBTYPE_UUID) {
                        throw new Error(`Expected Binary '${value.value}' to have a UUID subtype`)
                    }

                    return value
                }

                break
        }

        throw new Error('Expected a string, Buffer, or Binary')
    }

    fromDb(value: any, targetType?: object) {
        if (value === undefined) {
            return undefined
        } else if (!isBinary(value)) {
            throw new Error('Expected a Binary object')
        }

        const buffer = value.buffer

        if (buffer.byteLength !== 16) {
            throw new Error(
                `Expected Binary to have a buffer length of 16, got ${buffer.byteLength}`
            )
        } else if (value.sub_type !== Binary.SUBTYPE_UUID) {
            throw new Error(`Binary doesn't have UUID subtype`)
        }

        switch (targetType) {
            case Binary:
                return value
            case Buffer:
                return buffer
            case String:
                return (
                    buffer.toString('hex', 0, 4) +
                    '-' +
                    buffer.toString('hex', 4, 6) +
                    '-' +
                    buffer.toString('hex', 6, 8) +
                    '-' +
                    buffer.toString('hex', 8, 10) +
                    '-' +
                    buffer.toString('hex', 10, 16)
                )
            default:
                throw new Error(`Incompatible target type '${targetType}'`)
        }
    }

    getSupportedTypes() {
        return [Binary, Buffer, String]
    }

    /**
     * If auto-generation is enabled, return a new UUID Binary.  Otherwise, return undefined.
     */
    private maybeAutoGenerate() {
        if (this.options.autoGenerate) {
            switch (this.options.autoGenerate) {
                case 'v1':
                    return UuidConverter.createBinaryFromString(uuid.v1())
                case 'v4':
                    return UuidConverter.createBinaryFromString(uuid.v4())
                default:
                    return UuidConverter.createBinaryFromStringOrBuffer(this.options.autoGenerate())
            }
        }
    }

    private static createBinaryFromString(value: string) {
        const normalized = value.replace(/-/g, '').toLowerCase()
        const buffer = Buffer.from(normalized, 'hex')

        return UuidConverter.createBinaryFromBuffer(buffer)
    }

    private static createBinaryFromBuffer(buffer: Buffer) {
        return new Binary(buffer, Binary.SUBTYPE_UUID)
    }

    private static createBinaryFromStringOrBuffer(value: string | Buffer) {
        return typeof value === 'string'
            ? UuidConverter.createBinaryFromString(value)
            : UuidConverter.createBinaryFromBuffer(value)
    }
}
