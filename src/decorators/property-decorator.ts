import 'reflect-metadata';
import { PROPERTY_KEY } from '../metadata/property-metadata';
import { PropertyOptions } from '../interfaces';

export function Property(options: PropertyOptions) {
    return (target: any, propertyKey: string | symbol) => {
        Reflect.defineMetadata(PROPERTY_KEY, options, target.constructor, propertyKey);
    };
}
