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

    const toArray = theRecord => R.collect((k: string, v: number) => ({ k, v }))(theRecord);
    const opportunityLanguage = toArray(opportunityValues)
    const candidateLanguage = toArray(level)

    // si no hay nada requeridos entonces cumple la condicion
    if (opportunityLanguage.length === 0) return E.right(1);

    if (candidateLanguage.length === 0) return E.right(0)

    debug(`languages, candidate: ${JSON.stringify(candidateLanguage)}`);
    debug(`languages, opportunity: ${JSON.stringify(opportunityLanguage)}`);

    const getWeight = (candidate: any) => {
      const level = pipe(
        L.findFirst((x: any) => x.k === candidate.k)(opportunityLanguage),
        O.map(r => {
          debug(`languages, found : ${JSON.stringify(r)}`);
          return r.v
        }),
        O.getOrElse(() => 0)
      );

      const result = (level === 0) ? 0 // no encontre el lenguaje 
        : (candidate.v >= level) ? 1 // encontre y el level es mayor o igual al requerido
          : 0.25; // encontre el lenguaje pero el nivel es menor
      
      debug(`languages, result : ${result}`);
      return result;
    };

    const weight = pipe(
      candidateLanguage,
      L.foldMap(MonoidSum)(getWeight)
    )

    return E.right(weight / opportunityLanguage.length);
  }
}
