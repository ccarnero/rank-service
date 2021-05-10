import { ObjectID } from "mongodb";
const debug = require('debug')('verbose');

export const opportunitiesForCandidate = (id: string) => {
  const aggregation = [{
    $match: {
      companyMetadata: {
        $exists: true
      },
      _id: new ObjectID(id)
    }
  }, {
    $project: {
      idCompany: '$companyMetadata.idCompany',
      companyMetadata: 1
    }
  }, {
    $unwind: {
      path: '$idCompany'
    }
  }, {
    $lookup: {
      from: 'companies',
      let: { idc: '$idCompany' },
      pipeline: [
        {
          $match: {
            $expr:
            {
              $and: [
                { $eq: ['$id', '$$idc'] },
                { $eq: ['$services.rank', true] },
              ]
            }
          }
        }
      ],
      as: 'companies'
    }
  }, {
    $match: {
      'companies': { $ne: [] }
    }
  }, {
    $project: {
      oppsForCompany: {
        $filter: {
          input: '$companyMetadata',
          as: 'test',
          cond: {
            $eq: ['$$test.idCompany', '$idCompany']
          }
        }
      }
    }
  }, {
    $lookup: {
      from: 'opportunities',
      localField: 'oppsForCompany.metadata.idOpportunity',
      foreignField: 'id',
      as: 'opportunities'
    }
  }, {
    $project: {
      id: '$opportunities.id',
      age: '$opportunities.ageRange',
      experience: '$opportunities.experienceRange',
      educationLevel: '$opportunities.educationLevelsAdvanced',
      languages: '$opportunities.languages',
      professions: '$opportunities.professions',
      skills: '$opportunities.skillsReq',
      fieldsOfStudy: '$opportunities.fieldsOfStudy'
    }
  }];
  debug(JSON.stringify(aggregation, null, 1))
  return aggregation;
}
export const getCandidate = (id: string) => {
  const aggregation = [{
    $match: {
      _id: new ObjectID(id)
    }
  }, {
    $project: {
      id: 1,
      age: 1,
      experience: 1,
      educationLevel: 1,
      languages: 1,
      professions: 1,
      skills: 1,
      fieldsOfStudy: 1
    }
  }];

  debug(JSON.stringify(aggregation, null, 1))
  return aggregation;
}
export const candidatesForOpportunity = (id: string) => {
  const aggregation = [
    {
      '$match': {
        '_id': new ObjectID(id)
      }
    }, {
      '$lookup': {
        'from': 'companies',
        'let': {
          'idc': '$idCompany'
        },
        'pipeline': [
          {
            '$match': {
              '$expr': {
                '$and': [
                  {
                    '$eq': [
                      '$id', '$$idc'
                    ]
                  }, {
                    '$eq': [
                      '$services.rank', true
                    ]
                  }
                ]
              }
            }
          }
        ],
        'as': 'companies'
      }
    }, {
      '$match': {
        'companies': {
          '$ne': []
        }
      }
    }, {
      '$lookup': {
        'from': 'candidates',
        'as': 'candidates',
        'localField': 'id',
        'foreignField': 'companyMetadata.metadata.idOpportunity'
      }
    }, {
      '$project': {
        'id': 1,
        'age': '$ageRange',
        'experience': '$experienceRange',
        'educationLevel': '$educationLevelsAdvanced',
        'languages': 1,
        'professions': 1,
        'skills': 1,
        'fieldsOfStudy': 1,
        'candidates.id': 1,
        'candidates.age': 1,
        'candidates.experience': 1,
        'candidates.educationLevel': 1,
        'candidates.languages': 1,
        'candidates.professions': 1,
        'candidates.skills': 1,
        'candidates.fieldsOfStudy': 1
      }
    }
  ];
  debug(JSON.stringify(aggregation, null, 1))
  return aggregation;
}
export const getOpportunity = (id: string) => {
  const aggregation = [{
    $match: {
      _id: new ObjectID(id)
    }
  }, {
    $project: {
      id: 1,
      age: 1,
      experience: '$experienceRange',
      educationLevel: '$educationLevelsAdvanced',
      languages: 1,
      professions: 1,
      skills: '$skillsReq',
      fieldsOfStudy: 1
    }
  }];
  debug(JSON.stringify(aggregation, null, 1))
  return aggregation;
}