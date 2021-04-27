import * as E from 'fp-ts/lib/Either';

export interface Intersection<T> {
  _tag: 'Counter'
  values: Array<T>
}

const unique = (array: any[]) =>
  array.reduce((a, c) => {
    const result = !a.includes(c) ? a.concat([c]) : a;
    return result;
  }, [])

// remove duplicates
export function of<T>(values: Array<T>): Intersection<T> {
  const v = unique(values);
  return { _tag: 'Counter', values: v }
}

export function calculate<T>(i: Intersection<T>) {
  return (n: Array<T>): E.Either<Error, number> => {
    if(!n) return E.right(0)

    // si no hay nada requeridos entonces cumple la condicion
    if(i.values.length === 0) return E.right(1);

    const intersection = unique(n).reduce((a, c) => {
      if (i.values.includes(c)) {
        return a.concat([c])
      } else return a
    }, [] );

    const coincidences = intersection.length;
    if(coincidences === 0) return E.right(0);

    const initial = i.values.length;

    return E.right(coincidences/initial);
  }
}


