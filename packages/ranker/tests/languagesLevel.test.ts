import { expect } from 'chai'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function';
import * as L from '../src/modules/weigthCalculator/languagesLevel'

describe('languagesLevel calculation', function () {
  describe('with one language', function () {
    it('expect to return weight of 1 with none opportunity languages', function () {
      pipe(
        L.calculate(L.of({}))({ '': 1 }),
        E.bimap(
          l => expect.fail(),
          r => expect(r).equals(1)
        )
      )
    }),
      it('expect to return weight of 0 with none candidate languages', function () {
        pipe(
          L.calculate(L.of({ '': 1 }))({}),
          E.bimap(
            l => expect.fail(),
            r => expect(r).equals(0)
          )
        )
      }),
      it('expect to return weight of .25 when candidate has language but not reach level', function () {
        pipe(
          L.calculate(L.of({ 'en': 8 }))({ 'en': 2 }),
          E.bimap(
            l => expect.fail(),
            r => expect(r).equals(0.25)
          )
        )
      })
  });

  describe('with two languages', function () {
    it('expect to return weight of 1 when all matches', function () {
      pipe(
        L.calculate(L.of({ 'en': 1, 'fra': 1 }))({ 'en': 1, 'fra': 1 }),
        E.bimap(
          l => expect.fail(),
          r => expect(r).equals(1)
        )
      )
    }),
      it('expect to return weight of 0 with none candidate languages', function () {
        pipe(
          L.calculate(L.of({ 'po': 1, 'du': 1 }))({ 'en': 1, 'fra': 1 }),
          E.bimap(
            l => expect.fail(),
            r => expect(r).equals(0)
          )
        )
      }),
      it('expect to return weight of .25 when candidate has language but not reach level', function () {
        pipe(
          L.calculate(L.of({ 'en': 8, 'fra': 8 }))({ 'en': 3, 'fra': 4 }),
          E.bimap(
            l => expect.fail(),
            r => expect(r).equals(0.25)
          )
        )
      })
  })


  describe('with one for opportunity and two languages for candidate', function () {
    it('expect to return weight of 1 when all matches', function () {
      pipe(
        L.calculate(L.of({ 'fra': 1 }))({ 'en': 1, 'fra': 1 }),
        E.bimap(
          l => expect.fail(),
          r => expect(r).equals(1)
        )
      )
    }),
      it('expect to return weight of 0 with none candidate languages', function () {
        pipe(
          L.calculate(L.of({ 'du': 1 }))({ 'en': 1, 'fra': 1 }),
          E.bimap(
            l => expect.fail(),
            r => expect(r).equals(0)
          )
        )
      }),
      it('expect to return weight of .25 when candidate has language but not reach level', function () {
        pipe(
          L.calculate(L.of({ 'fra': 8 }))({ 'en': 3, 'fra': 4 }),
          E.bimap(
            l => expect.fail(),
            r => expect(r).equals(0.25)
          )
        )
      })
  })

})