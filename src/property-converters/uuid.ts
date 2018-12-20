import { PropertyConverter } from '../interfaces'
import { Binary } from 'bson'

function isBinary(value: any): value is Binary {
    return typeof value === 'object' && value.buffer && value.sub_type
}

/**
 * Convert a UUID in string form to a BSON Binary
 */
export class UuidConverter implements PropertyConverter {
    toDb(value: any) {
        if (value == null) {
            return value
        } else if (value instanceof Binary) {
            if (value.sub_type !== Binary.SUBTYPE_UUID) {
                throw new Error(`Expected Binary '${value.value}' to have a UUID subtype`)
            }

            return value
        }

        let buffer: Buffer

        if (typeof value === 'string') {
            const normalized = value.replace(/-/g, '').toLowerCase()
            buffer = Buffer.from(normalized, 'hex')
        } else if (value instanceof Buffer) {
            buffer = value
        } else {
            throw new Error('Expected a string or Buffer')
        }

        return new Binary(buffer, Binary.SUBTYPE_UUID)
    }

    fromDb(value: any, targetType?: object) {
        if (value == null) {
            return value
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
            case undefined:
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
}
