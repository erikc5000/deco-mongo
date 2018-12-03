import { ClassType } from './interfaces';
import { getPropertyMetadata } from './metadata/property-metadata';

export function mapObjectToDatabase<TInterface, TDocument extends object>(
    obj: TInterface,
    classType: ClassType<TDocument>
) {
    const mappedObject: any = {};

    // tslint:disable-next-line:forin
    for (const key in obj) {
        // const type = Reflect.getMetadata('design:type', classType, key);
        const propertyOptions = getPropertyMetadata(classType, key);

        let mappedKey: string = key;
        let value: any = obj[key];

        if (propertyOptions) {
            if (propertyOptions.name) mappedKey = propertyOptions.name;
            if (propertyOptions.converter) value = propertyOptions.converter.toDb(value);
        }

        if (mappedKey in mappedObject) {
            throw new Error(
                `Detected multiple properties mapped to the name '${mappedKey}' ` +
                    `on ${classType}.  Check @Property() definitions.`
            );
        } else {
            mappedObject[mappedKey] = value;
        }
    }

    return mappedObject;
}

export function mapObjectsToDatabase<TInterface, TDocument extends object>(
    objects: TInterface[],
    classType: ClassType<TDocument>
) {
    const mappedObjects = [];

    for (const obj of objects) {
        mappedObjects.push(mapObjectToDatabase(obj, classType));
    }

    return mappedObjects;
}

// export function mapObjectFromDatabase<TDatabase, TDocument extends object>(
//     obj: TDatabase,
//     classType: ClassType<TDocument>,
// ) {
//     const mappedObject = new Partial<TDocument>();

//     // tslint:disable-next-line:forin
//     for (const key in obj) {
//         // const type = Reflect.getMetadata('design:type', classType, key);
//         const propertyOptions = getPropertyMetadata(classType, key);

//         let mappedKey: string = key;
//         let value: any = obj[key];

//         if (propertyOptions) {
//             if (propertyOptions.name)
//                 mappedKey = propertyOptions.name;

//             if (propertyOptions.converter)
//                 value = propertyOptions.converter.toDb(value);
//         }

//         if (mappedKey in mappedObject) {
//             throw new Error(`Detected multiple properties mapped to the name '${mappedKey}' ` +
//                 `on ${classType}.  Check @Property() definitions.`);
//         } else {
//             mappedObject[mappedKey] = value;
//         }
//     }

//     return mappedObject;
// }
