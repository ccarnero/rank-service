import { pipe } from "fp-ts/lib/function"
import * as E  from "fp-ts/lib/Either"
import * as A from 'fp-ts/lib/Array'

import { calculate } from "../src/modules/weigthCalculator/ranker"
import { expect } from "chai"
import { MonoidSum } from "fp-ts/lib/number"
import { Candidate, Rank } from "@ranker/types"

const detailed = {
  id: '0',
  age: [18, 45],
  experience: [2, 10],
  educationLevel: [1, 2],
  languages: {'en' : 1, 'spa' : 1},
  professions: ['a', 'b', 'c'],
  skills: ['1', '2', '3', '4'],
  fieldsOfStudy: ['f1', 'f2', 'f3', 'f4']
};

const getWeight = (w: Candidate): E.Either<Error, number> =>
calculate({ candidate: w, opportunity: detailed })

const assertArrayOfCandidates = (candidates: Candidate[], expected: number) =>
pipe(
  A.traverse(E.either)(getWeight)(candidates),
  E.map(weights => A.array.foldMap(MonoidSum)(weights, x => x)),
  E.bimap(
    _ => expect.fail(),
    r => expect(r).equals(expected)
  )
)

describe('detailed opportunity', function() {
  it('rank should return 1 for bests candidates', function() {
    const candidates = [{
        id: "0",
        age: 18,
        experience: 2,
        educationLevel: 1,
        languages: {'en' : 1, 'spa' : 1},
        professions: ['a', 'b', 'c'],
        skills: ['1', '2', '3', '4'],
        fieldsOfStudy: ['f1', 'f2', 'f3', 'f4']
      },
      {
        id: "1",
        age: 30,
        experience: 3,
        educationLevel: 1,
        languages: {'en' : 1, 'spa' : 1},
        professions: ['a', 'b', 'c'],
        skills: ['1', '2', '3', '4'],
        fieldsOfStudy: ['f1', 'f2', 'f3', 'f4']
      },
      {
        id: "2",
        age: 45,
        experience: 10,
        educationLevel: 1,
        languages: {'en' : 1, 'spa' : 1},
        professions: ['a', 'b', 'c'],
        skills: ['1', '2', '3', '4'],
        fieldsOfStudy: ['f1', 'f2', 'f3', 'f4']
      }      
    ]
    return assertArrayOfCandidates(candidates, candidates.length)
  }),
  it('rank should return ~.85 for god candidate', function() {
    const candidates = [{
        id: "0",
        age: 50,
        experience: 2,
        educationLevel: 1,
        languages: {'en' : 1, 'spa' : 1},
        professions: ['a', 'b', 'c'],
        skills: ['1', '2', '3', '4'],
        fieldsOfStudy: ['f1', 'f2', 'f3', 'f4']
      }     
    ]
    return assertArrayOfCandidates(candidates, 0.8571428571428571)
  }),
  it('rank should return ~.71 for god candidate', function() {
    const candidates = [
      {
        id: "1",
        age: 50,
        experience: 0,
        educationLevel: 1,
        languages: {'en' : 1, 'spa' : 1},
        professions: ['a', 'b', 'c'],
        skills: ['1', '2', '3', '4'],
        fieldsOfStudy: ['f1', 'f2', 'f3', 'f4']
      }      
    ]
    return assertArrayOfCandidates(candidates, 0.7142857142857143)
  }),
  it('rank should return ~.57 for god candidate', function() {
    const candidates = [
      {
        id: "2",
        age: 50,
        experience: 0,
        educationLevel: 0,
        languages: {'en' : 1, 'spa' : 1},
        professions: ['a', 'b', 'c'],
        skills: ['1', '2', '3', '4'],
        fieldsOfStudy: ['f1', 'f2', 'f3', 'f4']
      }      
    ]
    return assertArrayOfCandidates(candidates, 0.5714285714285714)
  })     
})
