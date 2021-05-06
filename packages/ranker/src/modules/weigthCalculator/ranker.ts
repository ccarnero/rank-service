import * as B from './between';
import * as EL from './educationLevel';
import * as I from './intersection';
import * as E from 'fp-ts/lib/Either'
import * as A from 'fp-ts/lib/Array'
import { Rank } from "@ranker/types";
import { pipe } from 'fp-ts/lib/function';
import { MonoidSum } from 'fp-ts/number'

const debug = require('debug')('verbose')

const getWeight = (w: E.Either<Error, number>): E.Either<Error, number> => {
  debug(`weight: ${JSON.stringify(w)}`);

  return w;
}

export function calculate(x: Rank): E.Either<Error, number> {
  debug(`between -> age: opportunity = ${x.opportunity.age}, candidate = ${x.candidate.age}`);
  debug(`between -> experience: opportunity = ${x.opportunity.experience}, candidate = ${x.candidate.experience}`);
  debug(`educationLevel -> educationLevel: opportunity = ${x.opportunity.educationLevel.join()}, candidate = ${x.candidate.educationLevel}`);
  debug(`intersection -> languages: opportunity = ${x.opportunity.languages.join()}, candidate = ${x.candidate.languages.join()}`);
  debug(`intersection -> professions: opportunity = ${x.opportunity.professions.join()}, candidate = ${x.candidate.professions.join()}`);
  debug(`intersection -> skills: opportunity = ${x.opportunity.skills.join()}, candidate = ${x.candidate.skills.join()}`);
  debug(`intersection -> fieldsOfStudy: opportunity = ${x.opportunity.fieldsOfStudy.join()}, candidate = ${x.candidate.fieldsOfStudy.join()}`);

  const values = [
    B.calculate(B.of(x.opportunity.age))(x.candidate.age),
    B.calculate(B.of(x.opportunity.experience))(x.candidate.experience),
    EL.calculate(EL.of(x.opportunity.educationLevel))(x.candidate.educationLevel),
    I.calculate(I.of(x.opportunity.languages))(x.candidate.languages),
    I.calculate(I.of(x.opportunity.professions))(x.candidate.professions),
    I.calculate(I.of(x.opportunity.skills))(x.candidate.skills),
    I.calculate(I.of(x.opportunity.fieldsOfStudy))(x.candidate.fieldsOfStudy)
  ];
  return pipe(
    A.traverse(E.either)(getWeight)(values),
    E.map(weigths =>
      A.array.foldMap(MonoidSum)(weigths, (x) => {
        return x
      })
    ),
    E.map(sum => {
      const result = sum / values.length;
      return result;
    })
  )
}
