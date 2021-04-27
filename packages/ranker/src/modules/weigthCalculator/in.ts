import * as E from 'fp-ts/lib/Either'

export type In<T> = {
  _tag: 'In'
  values: Array<T>
}

export function of<T>(values: Array<T>): In<T> {
  return { _tag: 'In', values }
}

export function calculate<T>(b: In<T>) {
  return (n: T): E.Either<Error, number> => {
    if(!n) return E.right(0)

    // si no hay nada requeridos entonces cumple la condicion
    if(b.values.length === 0) return E.right(1);

    const { values } = b;
    if (values.includes(n)) return E.right(1);

    return E.right(0);
  }
}

