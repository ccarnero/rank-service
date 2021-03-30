
export const belongsToRankedCompany = (id: string) => [{
  $match: {
    companyMetadata: {
      $exists: true
    },
    id
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
}]