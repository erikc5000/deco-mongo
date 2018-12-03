import { PropertyConverter, ClassType } from './interfaces';
import { Int32, Double, ObjectID, Binary } from 'bson';

/**
 * Convert properties of a sub-document individually using a class derived from its interface
 * @param c The class to be used for conversion
 */
export function nestedPropertyConverter<T>(c: ClassType<T>) {
    const propertyConverter: PropertyConverter = {
        toDb: (value: any) => value,
        fromDb: (value: any) => value,
    };

    return propertyConverter;
}

/**
 * Convert a valid MongoDB object ID in string form into an ObjectID
 */
export const objectIdConverter: PropertyConverter = {
    toDb: (value: string | number) => new ObjectID(value),
    fromDb: (value: ObjectID) => value.toHexString(),
};

/**
 * Convert a valid UUID in string form to a BSON Binary
 */
export const uuidConverter: PropertyConverter = {
    toDb(value: any) {
        let buffer: Buffer;

        if (typeof value === 'string') {
            const normalized = value.replace(/-/g, '').toLowerCase();
            buffer = Buffer.from(normalized, 'hex');
        } else if (value instanceof Buffer) {
            buffer = value;
        } else {
            throw new Error('Expected a string or Buffer');
        }

        return new Binary(buffer, Binary.SUBTYPE_UUID);
    },
    fromDb(value: any, targetType?: any) {
        if (!(value instanceof Binary)) throw new Error(`Expected a Binary object`);
        else if (value.sub_type !== Binary.SUBTYPE_UUID)
            throw new Error(`Binary doesn't have UUID subtype`);

        const buffer = value.buffer;

        if (targetType === String) {
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
            );
        } else if (targetType === Object) {
            return buffer;
        } else {
            throw new Error(`Conversion to type '${targetType}' is unsupported`);
        }
    },
};

export const int32Converter: PropertyConverter = {
    toDb: (value: number) => new Int32(value),
    fromDb: (value: Int32) => value.valueOf(),
};

export const doubleConverter: PropertyConverter = {
    toDb: (value: number) => new Double(value),
    fromDb: (value: Double) => value.valueOf(),
};

interface GeoJsonLocation {
    coordinates: [number, number];
    type: string;
}

type Coordinates = [number, number];

export const geoJsonConverter: PropertyConverter = {
    toDb: (value: Coordinates): GeoJsonLocation => {
        if (
            !(value instanceof Array) ||
            value.length !== 2 ||
            typeof value[0] !== 'number' ||
            typeof value[1] !== 'number'
        ) {
            throw new Error(`Expected an array containing '[latitude, longitude]'`);
        }

        return {
            coordinates: [value[1], value[0]],
            type: 'Point',
        };
    },
    fromDb: (value: GeoJsonLocation) => [value.coordinates[1], value.coordinates[0]],
};
