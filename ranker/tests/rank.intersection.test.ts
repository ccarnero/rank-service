import { pipe } from "fp-ts/lib/function"
import * as E from "fp-ts/lib/Either"
import * as A from 'fp-ts/lib/Array'

import { calculate } from "../src/modules/weigthCalculator/ranker"
import { expect } from "chai"
import { MonoidSum } from "fp-ts/lib/number"
import { Candidate } from "../src/modules/types/candidate"

const generic = {
  id: '0',  
  age: [0, 1],
  experience: [0, 1],
  educationLevel: ['el1', 'el2'],
  languages: ['na'],
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
      age: 0,
      experience: 0,
      educationLevel: "el1",
      languages: ['na'],
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
      educationLevel: "EL9",
      languages: ['lna'],
      professions: ['pna'],
      skills: ['sna'],
      fieldsOfStudy: ['fna']
    }
    ]
    return assertArrayOfCandidates(candidates, 0);
  })
})


