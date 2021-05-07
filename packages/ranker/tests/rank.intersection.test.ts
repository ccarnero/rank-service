import { pipe } from "fp-ts/lib/function"
import * as E from "fp-ts/lib/Either"
import * as A from 'fp-ts/lib/Array'

import { calculate } from "../src/modules/weigthCalculator/ranker"
import { expect } from "chai"
import { MonoidSum } from "fp-ts/lib/number"
import { Candidate } from "@ranker/types"

const generic = {
  id: '0',  
  age: [18, 99],
  experience: [0, 1],
  educationLevel: [10, 11],
  languages: {'en':1},
  professions: ['na'],
  skills: ['na'],
  fieldsOfStudy: ['na']
};

const getWeight = (w: Candidate): E.Either<Error, number> =>
calculate({ candidate: w, opportunity: generic })

const assertArrayOfCandidates = (candidates: Candidate[], expected: number) =>
pipe(
  A.traverse(E.either)(getWeight)(candidates),
  E.map(weights => A.array.foldMap(MonoidSum)(weights, x => x)),
  E.bimap(
    _ => expect.fail(),
    r => expect(r).equals(expected)
  )
)

describe('opportunity only with intersection fields', function () {
  it('rank should return 1', function () {
    const candidates = [{
      id: "0",
      age: 18,
      experience: 0,
      educationLevel: 10,
      languages: {'en': 10},
      professions: ['na'],
      skills: ['na'],
      fieldsOfStudy: ['na']
    }
    ]
    return assertArrayOfCandidates(candidates, 1);
  })

  it('rank should return 0', function () {
    const candidates = [{
      id: "0",
      age: 10,
      experience: 10,
      educationLevel: 9,
      languages: {},
      professions: ['pna'],
      skills: ['sna'],
      fieldsOfStudy: ['fna']
    }
    ]
    return assertArrayOfCandidates(candidates, 0);
  })
})


