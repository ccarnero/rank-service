import { expect } from 'chai'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function';
import * as I from '../src/modules/weigthCalculator/in'

describe('In calculation', function() {
  it('expect to return weight of 1 in an empty array', function() {
    pipe(
      I.calculate(I.of([]))('1'),
      E.bimap(
        l => expect.fail(),
        r => expect(r).equals(1)
      )
    )
  }),
  it('expect to return weight of 1 in array of one element', function() {
    pipe(
      I.calculate(I.of(['1']))('1'),
      E.bimap(
        l => expect.fail(),
        r => expect(r).equals(1)
      )
    )
  }),
  it('expect to return weight of 0 in array of one element', function() {
    pipe(
      I.calculate(I.of(['1']))('0'),
      E.bimap(
        l => expect.fail(),
        r => expect(r).equals(0)
      )
    )
  })

})