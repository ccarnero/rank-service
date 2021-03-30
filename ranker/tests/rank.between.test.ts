import { pipe } from "fp-ts/lib/function"
import * as E  from "fp-ts/lib/Either"
import * as A from 'fp-ts/lib/Array'

import { calculate } from "../src/modules/weigthCalculator/ranker"
import { expect } from "chai"
import { MonoidSum } from "fp-ts/lib/number"
import { Candidate } from "../src/modules/types/candidate"

describe('opportunity only with within fields', function() {
  const generic = {
    id: '0',
    age: [20, 30],
    experience: [5, 10],
    educationLevel: [],
    languages: [],
    professions: [],
    skills: [],
    fieldsOfStudy: []
  };

  const getWeight = (w: Candidate): E.Either<Error, number> => 
  calculate({candidate: w, opportunity: generic})

  const assertArrayOfCandidates = (candidates: Candidate[], expected:number) =>
    pipe(
      A.traverse(E.either)(getWeight)(candidates),
      E.map(weights => A.array.foldMap(MonoidSum)(weights, x=>x)),
      E.bimap(
        _ => expect.fail(),
        r => expect(r).equals(expected)
      )
    )


  it('rank should return 1 for any candidate', function() {
    const candidates = [{
        id: "0",
        age: 20,
        experience: 5,
        educationLevel: "",
        languages: [],
        professions: [],
        skills: [],
        fieldsOfStudy: []
      },
      {
        id: "1",
        age: 25,
        experience: 7,
        educationLevel: "el1",
        languages: [],
        professions: [],
        skills: [],
        fieldsOfStudy: []
      },
      {
        id: "2",
        age: 30,
        experience: 10,
        educationLevel: "el1",
        languages: ['l1'],
        professions: [],
        skills: [],
        fieldsOfStudy: []
      }
    ]
    return assertArrayOfCandidates(candidates, candidates.length);
  }),

  it('rank should return ~.86 (6 of 7)', function(){
    const candidates = [{
      id: "0",
      age: 20,
      experience: 20,
      educationLevel: "",
      languages: [],
      professions: [],
      skills: [],
      fieldsOfStudy: []
    }
  ]
  assertArrayOfCandidates(candidates, 0.8571428571428571);
  }),

  it('rank should return ~.71 ( 5 of 7)', function(){
    const candidates = [{
      id: "0",
      age: 90,
      experience: 20,
      educationLevel: "",
      languages: [],
      professions: [],
      skills: [],
      fieldsOfStudy: []
    }
  ]
  assertArrayOfCandidates(candidates, 0.7142857142857143);
  })
})


