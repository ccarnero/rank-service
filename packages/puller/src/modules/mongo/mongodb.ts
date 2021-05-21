import { Db, ObjectID } from "mongodb";
import { taskEither } from "fp-ts";
import { opportunitiesForCandidate } from "./aggregations";
import { Candidate, Opportunity, Rank, EducationLevelMap } from "@ranker/types";

const debug = require('debug')('verbose');

const getLanguages = (languages: { map: (arg0: (l: { name: String; level: Number; }) => { name: String; level: Number; }) => Record<string, number>; }): Record<string, number> =>
  languages.map(
    (l: { name: String; level: Number; }) => ({ name: l.name, level: l.level })
  )

const getOpportunitiesForCandidate = async (candidate: Candidate, collection: string, db: Db): Promise<Array<Rank>> => {
  const dbCollection = db.collection(collection);

  const oppsForCandidate = opportunitiesForCandidate(candidate.id);
  const companies = await dbCollection.aggregate(oppsForCandidate).toArray();

  const agg = (p: any, c: Array<any>) => {
    const [key, value] = c;

    // Optimizacion 1
    // si el campo no tiene valor, entonces no aplica nada
    if (!value) return p;

    if (key === '_id' || key === 'id') {
      p[key] = value[0]
    } else {
      if (Array.isArray(value)) {
        p[key] = value.flat()
      }
      else { p[key] = value };
    }


    return p;
  };

  debug(`opportunities exists: ${companies.length > 0}`)

  const opportunities = companies
    .map(co => Object.entries(co).reduce(agg, {}))
    // solo proceso cambios en opps
    // que tengan props que NO esten en [id/_id]
    .filter(co => Object.keys(co).length > 2)
    .map(mongoOpportunityItem => { // toma solo el level del objeto de education
      const { educationLevel, languages, ...mongoOpportunity } = mongoOpportunityItem;
      const levels = educationLevel.map((el: { level: string; }) => EducationLevelMap[el.level]);
      const langs = getLanguages(languages);

      const opportunity: Opportunity = { ...mongoOpportunity, languages: langs, educationLevel: levels };
      return opportunity;
    })
    .map(o => {
      const opportunity: Opportunity = o;
      const rank: Rank = { candidate, opportunity }
      return rank;
    });
  debug(JSON.stringify(opportunities, null, 1));
  return opportunities;
}

export const GetOpportunitiesForCandidate = (collection: string, db: Db) =>
  (candidate: Candidate): taskEither.TaskEither<Error, Array<Rank>> => {
    return taskEither.tryCatch(
      () => getOpportunitiesForCandidate(candidate, collection, db),
      (reason) => new Error(String(reason))
    );
  }

const getCandidate = async (_idCandidate: string, collection: string, db: Db): Promise<Candidate> => {
  const dbCollection = db.collection(collection);

  const projection = {
    projection: {
      id: 1,
      age: 1,
      experience: 1,
      educationLevel: 1,
      languages: 1,
      professions: 1,
      skills: 1,
      fieldsOfStudy: 1
    }
  }
  const {
    educationLevel, languages, ...rest
  } = await dbCollection.findOne({ _id: new ObjectID(_idCandidate) }, projection);
  debug(`candidate exists: ${rest !== undefined}`)

  // const langs: Record<string, number> = languages.map(
  //   ( l: { name: String; level: Number; }) => ({ name: l.name, level: l.level })
  // )
  const langs = getLanguages(languages);
  debug(langs);
  const educationLevelValue: number = EducationLevelMap[educationLevel]
  const candidate: Candidate = {
    educationLevel: educationLevelValue,
    languages: langs,
    ...rest
  };
  return candidate;
}

export const GetCandidate = (collection: string, db: Db) =>
  (_idCandidate: string): taskEither.TaskEither<Error, Candidate> => {
    return taskEither.tryCatch(
      () => getCandidate(_idCandidate, collection, db),
      (reason) => new Error(String(reason))
    );
  }

