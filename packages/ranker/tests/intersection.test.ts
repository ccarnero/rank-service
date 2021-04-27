import { expect } from 'chai';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import * as I from '../src/modules/weigthCalculator/intersection';

describe('intersection', function () {
  it('should return weight of 1 with an empty array', function () {
    pipe(
      I.calculate(I.of([]))([0, 0, 0, 0, , 1, 1, 1]),
      E.bimap(
        l => expect.fail(),
        r => expect(r).equals(1)
      )
    )
  }),
  it('should return weight of 0', function () {
    pipe(
      I.calculate(I.of([3,4]))([0, 0, 0, 0, , 1, 1, 1]),
      E.bimap(
        l => expect.fail(),
        r => expect(r).equals(0)
      )
    )
  }),  
    it('should return weight of 1 with lot of duplicate items', function () {
      pipe(
        I.calculate(I.of([0, 0, 0, 1]))([0, 0, 0, 0, , 1, 1, 1]),
        E.bimap(
          l => expect.fail(),
          r => expect(r).equals(1)
        )
      )
    }),
    it('should return weight of .5 with lot of duplicate items', function () {
      pipe(
        I.calculate(I.of(['0', '0', '0', '1']))(['0', '0', '0', '0']),
        E.bimap(
          l => expect.fail(),
          r => expect(r).equals(.5)
        )
      )
    }),
    it('should return weight of .33 ', function () {
      pipe(
        I.calculate(I.of([0, 1, 2]))([0]),
        E.bimap(
          l => expect.fail(),
          r => expect(r).equals(0.3333333333333333)
        )
      )
    }),
    it('should return weight of .5 ', function () {
      pipe(
        I.calculate(I.of([0, 1]))([0]),
        E.bimap(
          l => expect.fail(),
          r => expect(r).equals(0.5)
        )
      )
    }),
    it('should return weight of .5 (more values in request)', function () {
      pipe(
        I.calculate(I.of([0, 1]))([0, 2, 3]),
        E.bimap(
          l => expect.fail(),
          r => expect(r).equals(0.5)
        )
      )
    })
  it('should return weight of .33 ', function () {
    pipe(
      I.calculate(I.of([0, 1, 2]))([0]),
      E.bimap(
        l => expect.fail(),
        r => expect(r).equals(0.3333333333333333)
      )
    )
  }),
    it('should return weight of .33 (more values in request)', function () {
      pipe(
        I.calculate(I.of([0, 1, 2]))([0, 3]),
        E.bimap(
          l => expect.fail(),
          r => expect(r).equals(0.3333333333333333)
        )
      )
    })
})