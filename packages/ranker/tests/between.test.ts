import { expect } from "chai"
import * as E  from "fp-ts/lib/Either"
import { pipe } from 'fp-ts/lib/function';
import * as B from '../src/modules/weigthCalculator/between'

describe('Between calculation', function () {
  it('expect fail when array lenght is not 2', function() {
    pipe(
      B.calculate(B.of([0,10,100]))(5),
      E.bimap(
        l => expect(l.message).equals('Array must have exactly two elements'),
        r => expect.fail()
      )
    )
    pipe(
      B.calculate(B.of([0]))(5),
      E.bimap(
        l => expect(l.message).equals('Array must have exactly two elements'),
        r => expect.fail()
      )
    )
  }),

  it('expect weight of 1', function() {
    pipe(
      B.calculate(B.of([0,10]))(5),
      E.bimap(
        l => expect.fail(),
        r => expect(r).equals(1)
      )
    )
  })

  it('expect weight of 0', function() {
    pipe(
      B.calculate(B.of([0,10]))(11),
      E.bimap(
        l => expect.fail(),
        r => expect(r).equals(0)
      )
    )
  })
})