import { DecoMongoError } from './deco-mongo.error'

export class UpdateError extends DecoMongoError {
    constructor(readonly mongoResult?: object) {
        super('MongoDB update operation failed.')
    }
}
