import { DecoMongoError } from './deco-mongo.error'

export class InsertionError extends DecoMongoError {
    constructor(readonly mongoResult?: object) {
        super('MongoDB insertion failed.')
    }
}
