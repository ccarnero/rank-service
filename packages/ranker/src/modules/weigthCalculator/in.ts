import * as E from 'fp-ts/lib/Either'

export type In<T> = {
  _tag: 'In'
  values: Array<T>
}

export function of<T>(values: Array<T>): In<T> {
  return { _tag: 'In', values }
}

export function calculate<T>(list: In<T>) {
  return (value: T): E.Either<Error, number> => {
    // si no hay nada requeridos entonces cumple la condicion
    if(list.values.length === 0) return E.right(1);

    if(!value) return E.right(0)

    const { values } = list;
    if (values.includes(value)) return E.right(1);

    return E.right(0);
  }
}

