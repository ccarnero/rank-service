import * as L from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import { MonoidSum } from 'fp-ts/lib/number'
import * as O from 'fp-ts/lib/Option'
import * as R from 'fp-ts/lib/Record'

const debug = require('debug')('verbose')

export type LanguageLevel = {
  _tag: 'LanguageLevel'
  values: Record<string, number>
}

export function of(values: Record<string, number>): LanguageLevel {
  return { _tag: 'LanguageLevel', values }
}

export function calculate(languagesLevels: LanguageLevel) {
  return (level: Record<string, number>): E.Either<Error, number> => {
    const { values: opportunityValues } = languagesLevels;

    const toArray = theRecord => R.collect((_k: string, v: number) => (v))(theRecord);
    const opportunityLanguageArray = toArray(opportunityValues)
    const candidateLanguageArray = toArray(level)

    // si no hay nada requeridos entonces cumple la condicion
    if (opportunityLanguageArray.length === 0) return E.right(1);

    if (candidateLanguageArray.length === 0) return E.right(0)

    debug(`languages, candidate: ${JSON.stringify(candidateLanguageArray)}`);
    debug(`languages, opportunity: ${JSON.stringify(opportunityLanguageArray)}`);

    const getWeight = (candidateLanguages: any) => {
      const level = pipe(
        L.findFirst((x: any) => {
          return x.name === candidateLanguages.name
        })(opportunityLanguageArray),
        O.map(r => {
          debug(`languages, found : ${JSON.stringify(r)}`);
          // return r.level
          return 1
        }),
        O.getOrElse(() => 0)
      );

      const result = (level === 0) ? 0 // no encontre el lenguaje 
        : (candidateLanguages.level >= level) ? 1 // encontre y el level es mayor o igual al requerido
          : 0.25; // encontre el lenguaje pero el nivel es menor
      
      debug(`language weight: ${result}`);
      return result;
    };

    const weight = pipe(
      candidateLanguageArray,
      L.foldMap(MonoidSum)(getWeight)
    )

    return E.right(weight / opportunityLanguageArray.length);
  }
}
