import * as E from 'fp-ts/lib/Either'

export type Between = {
  _tag: 'Between'
  limits: Array<number>
}

export function of(limits: Array<number>): Between {
  return { _tag: 'Between', limits }
}

export class LimitsLengthValidationError extends Error {
  public _tag: 'LimitsLengthValidationError'
  public length: number

  private constructor(length:number) {
    super('Array must have exactly two elements');
    this._tag = 'LimitsLengthValidationError';
    this.length = length;
  }

  public static of(length:number):LimitsLengthValidationError {
    return new LimitsLengthValidationError(length);
  }
}

export type BetweenValidationErrors = 
  | LimitsLengthValidationError

export function calculate(b:Between) {
  return (n:number) : E.Either<Error, number> => {
    if(!n) return E.right(0)
    // si no hay nada requeridos entonces cumple la condicion
    if(b.limits.length === 0) return E.right(1);

    if(b.limits.length !== 2) {
      return E.left(LimitsLengthValidationError.of(b.limits.length))
    }
    const [head, tail] = b.limits;
    if(n >= head && n <= tail) return E.right(1);

    return E.right(0);
  }
}
