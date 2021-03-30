import * as B from './between';
import * as IN from './in';
import * as I from './intersection';
import * as E from 'fp-ts/lib/Either'
import * as A from 'fp-ts/lib/Array'
import { Rank } from '../types/rank';
import { pipe } from 'fp-ts/lib/function';
import { MonoidSum } from 'fp-ts/number'

const getWeight = (w: E.Either<Error, number>): E.Either<Error, number> => w

export function calculate(x: Rank): E.Either<Error, number> {
  const values = [
    B.calculate(B.of(x.opportunity.age))(x.candidate.age),
    B.calculate(B.of(x.opportunity.experience))(x.candidate.experience),
    IN.calculate(IN.of(x.opportunity.educationLevel))(x.candidate.educationLevel),
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
