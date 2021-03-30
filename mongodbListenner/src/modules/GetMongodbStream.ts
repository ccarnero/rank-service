import { Db } from "mongodb";

const toRankPipeline = (properties: Array<string>): Array<Object> => {
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
        documentKey: 1,
        fieldsUpdated: {
          $objectToArray: '$updateDescription.updatedFields'
        }
      }
    },
    {
      $project: {
        documentKey: 1,
        _id: 1,
        keys: '$fieldsUpdated.k',
        properties
      }
    },
    {
      $project: {
        _id: 1,
        id: {
          $toString: "$documentKey._id"
        },
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

const GetMongodbStream = async (collection: string, properties: Array<string>, db: Db) => {
  const pipeline = toRankPipeline(properties);
  console.log(JSON.stringify(pipeline, null, 2))
  return db.collection(collection).watch(pipeline);
}

export default GetMongodbStream;
