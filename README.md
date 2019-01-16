# Deco-Mongo

## Description

Deco-Mongo is a lightweight and modern MongoDB object modeling library, intended for use in Typescript applications of all sizes. By taking advantage of newer language features like reflection and decorators (hence the "deco"), it provides some level of type safety and an overall more pleasant developer experience than older libraries like Mongoose -- in this author's totally biased opinion, anyway. :smiley:

## Installation

In your Typescript application:

```
$ npm install deco-mongo mongodb reflect-metadata
$ npm install -D @types/mongodb
```

Make sure that experimental decorator and metadata support are enabled in your tsconfig.json file.

```json
"experimentalDecorators": true,
"emitDecoratorMetadata": true
```

## Usage

### Defining relationships between classes and MongoDB documents

Deco-Mongo is all about data mapping. You write classes that represent your data the way you want it to be structured in the domain or business logic layer of your application, then add decorations that describe how it should map over to your database.

Let's suppose that I want to store info about dogs in my database.

```typescript
import {
    Collection,
    Indexes,
    Property,
    ObjectIdProperty,
    IntProperty,
    UpdateTimestamp,
    GeoJsonPointConverter
} from 'deco-mongo'

export interface Dog {
    id?: string
    name: string
    breed?: string
    age?: number
    likesPizza?: boolean
    homeLocation?: [number, number]
}

@Collection('dogs')
@Indexes({ key: { name: 1 }, unique: true })
export class DogDocument implements Dog {
    @ObjectIdProperty({ name: '_id', autoGenerate: true })
    id?: string

    @Property()
    name: string = ''

    @Property()
    breed?: string

    @IntProperty()
    age?: number

    @Property({
        converter: {
            fromDb: value => {
                switch (typeof value) {
                    case 'string:
                        return value === 'true' ? true : false
                    case 'boolean':
                        return value
                    case 'undefined':
                        return undefined
                    default:
                        throw new Error('Unexpected type!')
                }
            }
        }
    })
    likesPizza?: boolean

    @Property({ converter: new GeoJsonPointConverter() })
    homeLocation?: [number, number]

    @UpdateTimestamp()
    lastModified?: Date
}
```

In this example, we have a DogDocument class, which we've mapped to the database using a variety of decorators.

#### Linking to a collection

The `@Collection()` decorator defines a link between DogDocument and a MongoDB collection named 'dogs'. You'll see later that Deco-Mongo can automatically initialize the collection with any specified options.

#### Defining indexes

If you wish to define indexes within your code, you can use the `@Indexes()` decorator. On DogDocument, we've defined a unique index on the `name` property. The index specifications are provided directly to Mongo, so define them as you would in the [MongoDB shell](https://docs.mongodb.com/manual/reference/command/createIndexes/). By default, any indexes defined here will be created only if the collection doesn't already exist. Use caution when creating indexes in your code as this may not be desirable in production systems.

#### Defining properties

To save and restore any individual property of a class, it must be annotated with `@Property()` or one of its specializations -- like `@ObjectIdProperty()` or `@IntProperty()`. By default, an annotated property will be mapped to the database as-is.

#### Renaming a property

A property can be renamed to something else when stored in the database be using the `name` option. For example, in DogDocument, we mapped the `id` property on the class to the special `_id` property used by Mongo.

```typescript
@ObjectIdProperty({ name: '_id', autoGenerate: true })
id?: string
```

#### Property converters

The value of a property can also be modified through the use of a property converter. In DogDocoument, we specified one inline on the `likesPizza` property:

```typescript
@Property({
    converter: {
        fromDb: value => {
            switch (typeof value) {
                case 'string:
                    return value === 'true' ? true : false
                case 'boolean':
                    return value
                case 'undefined':
                    return undefined
                default:
                    throw new Error('Unexpected type!')
            }
        }
    }
})
likesPizza?: boolean
```
In this example, we're handling the possibility that the database provides us with a string instead of the boolean that our class is expecting. At some point in the past, maybe we stored `likesPizza` as a string, but now we don't. With a converter, we're able to upgrade the data on read as opposed to updating the documents in the database all at once, which can help facilitate a graceful migration.

It's also possible to provide an instance of your own property converter class.

```typescript
class StringConverter extends PropertyConverter {
    toDb(value: any) {
        switch (typeof value) {
            case 'undefined':
                return undefined
            case 'number':
                return String(value)
            case 'string':
                return value
            default:
                throw new Error("This converter doesn't know how to handle that value!")
        }
    }

    fromDb(value: any, targetType?: any) {
        if (value === undefined) {
            return undefined
        } else if (typeof value !== 'string') {
            throw new Error("I wasn't expecting to get a non-string value out of the database!")
        }

        switch (targetType) {
            case String:
                return value
            case Number:
                return parseFloat(value)
            default:
                throw new Error("I can't handle converting the value to that type of variable!")
        }
    }

    getSupportedTypes() {
        return [Number, String]
    }
}
```

The above class will accept a string or number value and always persist it as a string value in the database. Upon reading the value, it will automatically convert it to the type expected by the property in the class. The advantage of using a property converter class like this is that it provides some level of type safety and can be reused in multiple places. Of course, an inline converter is perfectly acceptable for simple one-off conversions.

It's worth noting that by design, Deco-Mongo refrains from automatically converting values from one type to another, instead throwing an exception. This is to help prevent silent issues from creeping into your application.

#### Built-in property converters

You may have noticed that we used several variations of `@Property()` and custom converters in DogDocument. These are all built-in property converters that are available in Deco-Mongo. For convenience, most of the built-in converters have decorators associated with them. That means that...

```typescript
@Property({ converter: new IntConverter() })
age?: number
```

... is equivalent to...

```typescript
@IntProperty()
age?: number
```

Here's the full list of converters:

| Converter               | Decorator           | Description                                                                                                            |
| ----------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `ObjectIdConverter`     | `@ObjectIdProperty` | Converts string IDs to Mongo ObjectIDs and optionally auto-generates them                                              |
| `UuidConverter`         | `@UuidProperty`     | Converts UUIDs of any format in string or Buffer form to BSON binary representation and optionally auto-generates them |
| `IntConverter`          | `@IntProperty`      | The value will be represented as a BSON 32-bit integer value                                                           |
| `DoubleConverter`       | `@DoubleProperty`   | The value will be represented as a BSON double-precision floating point value                                          |
| `NestedConverter`       | `@NestedProperty`   | Convert a sub-document or array of sub-documents using the property definitions on a class representing it             |
| `GeoJsonPointConverter` |                     | Converts a coordinate array to a GeoJSON point, suitable for geospatial indexing in Mongo                             |

#### Timestamp properties

You may have also noticed that the `lastModified` property in DogDocument uses the `@UpdateTimestamp()` decorator. This decorator is used to indicate that the property is a timestamp that should be automatically set to the date at the time the that record is mapped for insertion or update.

There is a similar `@CreationTimestamp()` decorator, which will be automatically set when a document is inserted, but left untouched after that.

The timestamps are generated on the client-side and unlikely to be accurate enough to determine exact order when dealing with high volumes of concurrent modifications.

#### Unique document IDs

Every document in Mongo will have an `\_id` field associated with it. Deco-Mongo requires that at least one property be mapped to `\_id`. The type is unimportant -- it's value just has to be unique. In DogDocument, we mapped a string property named `id` to a Mongo ObjectID. Alternatively, we could have used a UUID as our ID:

```typescript
@UuidProperty({ name: '_id', autoGenerate: 'v4' })
id?: string
```

While somewhat less performant than ObjectIDs, UUIDs are more standard and versatile. Both are well-supported by Deco-Mongo.

#### Initializing a collection

Deco-Mongo functions as a mapping layer on top of the MongoDB driver rather than replacing it entirely.  You must first establish a connection using the MongoDB driver:

'''typescript
const client: MongoClient = await MongoClient.connect('mongodb://localhost')
const db: Db = client.db('AppDB')
'''

To initialize a collection using Deco-Mongo, you can do the following:

```typescript
const collection = await DecoMongo.initializeCollection(DogDocument, db)
```

### Mapping documents

So now that we've covered how to define a mapping between a class and a MongoDB document, it's time to look at how we can apply it.

At the lowest level, this can be done through the use of a `Mapper` object.

```typescript
const mapper = new Mapper(DogDocument)

async function insert(dog: DogDocument) {
    const mappedDoc = mapper.mapForInsert(dog)
    // dog = { name: 'None' } as DogDocument
    // mappedDoc = { _id: ObjectID(<generated>), name: 'None', lastModified: Date(<now>) } as object

    // Insert using the MongoDB driver directly
    const result = await db.collection('dogs').insertOne(mappedDoc)

    if (result.insertedCount === 1) {
        const mappedResult = mapper.mapFromResult(result.ops[0])
        // mappedResult = { _id: ObjectID(<generated>), name: 'None', likesPizza: true, lastModified: Date(<now>) } as DogDocument
    }
}

const dog = new DogDocument()
insert(dog)
```

In the above example, we've created a DogDocument `Mapper` object, which we then use to map into a document ready for insertion, insert it, and then map the result back into a DogDocument again.

We could also map a document into a form ready for a MongoDB update operation:

```typescript
async function update(id: string, dog: DogDocument) {
    // dog = { id: <provided>, name: 'Jimmy', likesPizza: true } as DogDocument

    const filter = mapper.mapPartialToDb({ id })
    // filter = { _id: ObjectID(<provided>) } as object

    const updateDoc = mapper.mapForUpdate(dog)
    // updateDoc = {
    //   $set: { name: 'Jimmy', likesPizza: true, lastModified: Date(<now>) },
    //   $unset: { breed: '', age: '', homeLocation: '' }
    // } as object

    await db.collection('dogs').updateOne(filter, updateDoc)
}
```

When mapping for an update, we're not assuming any knowledge of what the document looks like in the database -- it just overwrites everything except for the ID and any creation timestamps. Creation of partial update documents isn't supported at this time, though you can map selected fields by using `mapPartialToDb()`, which we did to convert the ID used to find the document that we updated.

#### Creating a DAO

[Not finished]

## General Guidance

#### Prefer undefined to null

It's recommended that you use undefined rather than null to represent empty properties. Due to limitations of the reflected type metadata, any property that allows null will lose automatic type checking and won't work with the built-in property converters.

Undefined properties will be left out of the database document when saving. During restoration, undefined properties will be populated by the class's default value, if present, or remain undefined.

#### Use joi or class-validator to perform validation

Deco-Mongo is focused on data mapping -- not validation. Of course, you should always validate your data. Both [joi](https://www.npmjs.com/package/joi) and [class-validator](https://www.npmjs.com/package/class-validator) are excellent tools for doing this.

MongoDB supports using a JSON Schema for validation, but it's best used as a backstop to ensure basic data integrity. At the time of writing, it still doesn't report any information about what specifically failed validation, making debugging a bit challenging to say the least.

#### Consider using class-transformer to map objects to classes

If you have data coming in over the network or from any external source, you'll probably have a need to turn some plain Javascript objects into class instances in order to work with them in Deco-Mongo -- and possibly in your domain layer. You could do the conversion manually, but [class-transformer](https://www.npmjs.com/package/class-transformer) can save you some trouble.

#### Consider data upgrade

In using Mongo, you gain the ability to perform data upgrade on read as opposed to performing a wholesale migration as you would with a relational database. The combination of default class values, custom property converters, and the addition of a version property can all help facilitate data upgrade scenarios.

#### Keep the data and domain layers separate

Deco-Mongo is designed to be used in the data layer of your application and help you avoid bubbling up persistance concerns into your business logic. Take advantage of property converters to map between the in-memory data structures of your domain layer and their database representation. You can also use interfaces to avoid polluting the domain layer data structures with Deco-Mongo decorations.
