import { PropertyConverter } from '../interfaces'
import { Binary } from 'bson'

/**
 * Convert a valid UUID in string form to a BSON Binary
 */
export class UuidConverter implements PropertyConverter {
    toDb(value: any) {
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

    fromDb(value: any) {
        if (typeof value !== 'object' || !value.buffer || !value.sub_type)
            throw new Error('Expected a Binary object')

        // if (!(value instanceof Binary)) throw new Error(`Expected a Binary object`)

        const binaryValue = value as Binary
        const buffer = binaryValue.buffer

        if (buffer.byteLength !== 16) {
            throw new Error(
                `Expected Binary to have a buffer length of 16, got ${buffer.byteLength}`
            )
        } else if (binaryValue.sub_type !== Binary.SUBTYPE_UUID) {
            throw new Error(`Binary doesn't have UUID subtype`)
        }

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
    }
}
