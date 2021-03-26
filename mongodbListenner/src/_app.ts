import { MongoClient, MongoClientOptions } from "mongodb";

const uri: string = `${process.env.MONGODB_URI}`
const options:MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true }

const toFind = ['lastModified', 'likeTheseOpportunities'];

const toRankPipeline = (properties:Array<String>) : Array<Object> => {
  return [
    {
      $match: {
        $and: [
          { 'operationType': { $eq: 'update' } },
          {
            'updateDescription.updatedFields': {
              $exists: true
            }
          }
        ]
      }
    },
    {
      $project: {
        fieldsUpdated: {
          $objectToArray: '$updateDescription.updatedFields'
        }
      }
    },
    {
      $project: {
        _id: 1,
        keys: '$fieldsUpdated.k',
        properties
      }
    },
    {
      $project: {
        results: {
          $setIntersection: [
            "$keys",
            "$properties"
          ]
        }
      }
    },
    {
      $match: {
        'results.0': {
          $exists: true
        }
      }
    }
  ];
}

const main = async () => {
  const cnn:MongoClient = new MongoClient(uri, options);
  await cnn.connect();
  const pipeline = toRankPipeline(toFind);
  const changeStream = cnn.db().collection('candidates').watch(pipeline);
  while( await changeStream.hasNext()){
    console.log(await changeStream.next());
  }
}


main().catch(console.error);
