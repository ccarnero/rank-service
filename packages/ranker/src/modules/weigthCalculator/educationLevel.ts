import * as E from 'fp-ts/lib/Either'

export type EducationLvl = {
  _tag: 'EducationLvl'
  values: Array<number>
}

export function of(values: Array<number>): EducationLvl {
  return { _tag: 'EducationLvl', values }
}

export function calculate(educationLevels: EducationLvl) {
  return (level: number): E.Either<Error, number> => {
    const { values } = educationLevels;
    // si no hay nada requeridos entonces cumple la condicion
    if(values.length === 0) return E.right(1);

    if(!level) return E.right(0)

    const isValid = values.some(lvl => level >= lvl);
    if (isValid) return E.right(1);

    return E.right(0);
  }
}

