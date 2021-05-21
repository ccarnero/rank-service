import { Db } from "mongodb";
import { taskEither as TE } from "fp-ts";

import { Candidate, EducationLevelMap, Opportunity, Rank } from "@ranker/types";
import { candidatesForOpportunity, getCandidate, getOpportunity, opportunitiesForCandidate } from "./mongo/aggregations";
const verbose = require('debug')('verbose');
const debug = require('debug')('debug');

export const isCandidate = () => (process.env.REDIS_READ_CHANNEL === 'candidates')

const getLanguages = (languages: { map: (arg0: (l: { name: String; level: Number; }) => { name: String; level: Number; }) => Record<string, number>; }): Record<string, number> =>
  languages.map(
    (l: { name: String; level: Number; }) => ({ name: l.name, level: l.level })
  )

const cleanUpProperties = (p: any, c: Array<any>) => {
  const [key, value] = c;
  if (!value) return p;

  //TODO -> ese isCandidate es porque la Aggregation hace algo raro con el id/_id
  if (key === '_id' || key === 'id' && isCandidate()) {
    p[key] = value[0]
    return p
  } 
  
  if (Array.isArray(value)) {
    p[key] = value.flat()
  }
  else { p[key] = value };
  return p;
};

type getCandidatesFromDb = (db: Db) => (oid: string) => Promise<Array<Candidate>>
export const getCandidatesFromCandidate: getCandidatesFromDb = (db: Db) => async (oid: string) => {
  const dbCollection = db.collection('candidates');

  const oppsForCandidate = getCandidate(oid);
  const [item] = await dbCollection.aggregate(oppsForCandidate).toArray();

  const {
    educationLevel, languages, ...rest
  } = item;
  debug(`candidate exists: ${rest !== undefined}`)

  const langs = getLanguages(languages);
  debug(langs);
  const educationLevelValue: number = EducationLevelMap[educationLevel]
  const candidate: Candidate = {
    educationLevel: educationLevelValue,
    languages: langs,
    ...rest
  };
  return [candidate];
}
export const getCandidatesFromOpportunity: getCandidatesFromDb = (db: Db) => async (oid: string) => {
  const dbCollection = db.collection('opportunities');

  const candidateForOpps = candidatesForOpportunity(oid);
  const oppsWithCandidates = await dbCollection.aggregate(candidateForOpps).toArray();
  const { candidates = [] } = oppsWithCandidates[0];
  const result = candidates
    .map(co => Object.entries(co).reduce(cleanUpProperties, {}))
    // solo proceso cambios en opps
    // que tengan props que NO esten en [id/_id]
    .filter(co => Object.keys(co).length > 2)
    .map(mongoCandidateItem => { // toma solo el level del objeto de education
      const { educationLevel: el, languages, ...mongoCandidate } = mongoCandidateItem;
      const educationLevel: number = EducationLevelMap[el]
      const langs = getLanguages(languages);
      const candidate: Candidate = { ...mongoCandidate, languages: langs, educationLevel };
      debug(candidate)
      return candidate;
    });

  return result;
}

type getOpportunitiesFromDb = (db: Db) => (oid: string) => Promise<Array<Opportunity>>
export const getOpportunitiesFromCandidate: getOpportunitiesFromDb = (db: Db) => async (oid: string) => {
  const dbCollection = db.collection('candidates');

  const oppsForCandidate = opportunitiesForCandidate(oid);
  const companies = await dbCollection.aggregate(oppsForCandidate).toArray();

  debug(`opportunities exists: ${companies.length > 0}`)

  const opportunities = companies
    .map(co => Object.entries(co).reduce(cleanUpProperties, {}))
    // solo proceso cambios en opps
    // que tengan props que NO esten en [id/_id]
    .filter(co => Object.keys(co).length > 2)
    .map(mongoOpportunityItem => { // toma solo el level del objeto de education
      const { educationLevel, languages, ...mongoOpportunity } = mongoOpportunityItem;
      const levels = educationLevel.map((el: { level: string; }) => EducationLevelMap[el.level]);
      const langs = getLanguages(languages);

      const opportunity: Opportunity = { ...mongoOpportunity, languages: langs, educationLevel: levels };
      return opportunity;
    });
  debug(JSON.stringify(opportunities, null, 1));
  return opportunities;
}
export const getOpportuniesFromOpportunity: getOpportunitiesFromDb = (db: Db) => async (oid: string) => {
  const dbCollection = db.collection('opportunities');

  const opportunityForOpportunity = getOpportunity(oid);
  const [item] = await dbCollection.aggregate(opportunityForOpportunity).toArray();

  const {
    educationLevel, languages, ...rest
  } = item;
  debug(`candidate exists: ${rest !== undefined}`)

  const langs = getLanguages(languages);
  const educationLevelValue = educationLevel.map((el: { level: string; }) => EducationLevelMap[el.level]);
  const opportunity: Opportunity = {
    educationLevel: educationLevelValue,
    languages: langs,
    ...rest
  };
  return [opportunity];
}

type getCandidatesFromOid = (oid: string) => Promise<Array<Candidate>>
type getOpportunitiesFromOid = (oid: string) => Promise<Array<Opportunity>>
type getRankTupleList = (getCandidates: getCandidatesFromOid) => (getOpportunities: getOpportunitiesFromOid) => (message: string) => TE.TaskEither<Error, Rank[]>
export const getRankTupleList: getRankTupleList = (getCandidates: getCandidatesFromOid) => (getOpportunities: getOpportunitiesFromOid) => (message: string) => {
  const all = TE.tryCatch(
    async () => {
      // TODO: => este if desentona aca
      if (isCandidate()) {
        const candidates = await getCandidates(message);
        const opportunities = await getOpportunities(message);
        debug('from candidate collection, total candidates to rank: ', candidates.length);
        debug('from candidate collection, total opportunities to rank: ', opportunities.length);

        const candidate = candidates[0];
        const result = opportunities.map(opportunity => {
          const rank: Rank = { candidate, opportunity }
          return rank;
        })
        verbose('result: ', JSON.stringify(result, null, 2));
        return new Array<Rank>().concat(result);
      }

      const candidates = await getCandidates(message);
      const opportunities = await getOpportunities(message);
      debug('from opps collection, total candidates to rank: ', candidates.length);
      debug('from opps collection, total opportunities to rank: ', opportunities.length);

      const opportunity = opportunities[0];
      const result = candidates.map(candidate => {
        const rank: Rank = { candidate, opportunity }
        return rank;
      })

      verbose('result: ', JSON.stringify(result, null, 2));
      return new Array<Rank>().concat(result);
    },
    (reason) => new Error(String(reason))
  );
  return all;
}


