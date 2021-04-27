import { pipe } from "fp-ts/lib/function"
import { Rank } from "../src/modules/types/rank"
import * as E  from "fp-ts/lib/Either"
import * as A from 'fp-ts/lib/Array'

import { calculate } from "../src/modules/weigthCalculator/ranker"
import { expect } from "chai"
import { traverse } from "fp-ts/lib/Array"
import { MonoidSum } from "fp-ts/lib/number"
import { Candidate } from "../src/modules/types/candidate"

describe('generic opportunity', function() {
  const generic = {
    id: '0',    
    age: [],
    experience: [],
    educationLevel: [],
    languages: [],
    professions: [],
    skills: [],
    fieldsOfStudy: []
  };

  it('rank should return 1 for any candidate', function() {
    const getWeight = (w: Candidate): E.Either<Error, number> => 
      calculate({candidate: w, opportunity: generic})

    const candidates = [{
        id: "0",
        age: 0,
        experience: 0,
        educationLevel: "",
        languages: [],
        professions: [],
        skills: [],
        fieldsOfStudy: []
      },
      {
        id: "1",
        age: 1,
        experience: 1,
        educationLevel: "el1",
        languages: [],
        professions: [],
        skills: [],
        fieldsOfStudy: []
      },
      {
        id: "2",
        age: 1,
        experience: 1,
        educationLevel: "el1",
        languages: ['l1'],
        professions: [],
        skills: [],
        fieldsOfStudy: []
      },
      {
        id: "3",
        age: 1,
        experience: 1,
        educationLevel: "el1",
        languages: ['l1'],
        professions: ['p1'],
        skills: [],
        fieldsOfStudy: []
      },
      {
        id: "4",
        age: 1,
        experience: 1,
        educationLevel: "el1",
        languages: ['l1'],
        professions: ['p1'],
        skills: [],
        fieldsOfStudy: []
      },
      {
        id: "5",
        age: 1,
        experience: 1,
        educationLevel: "el1",
        languages: ['l1'],
        professions: ['p1'],
        skills: ['s1'],
        fieldsOfStudy: []
      },
      {
        id: "6",
        age: 1,
        experience: 1,
        educationLevel: "el1",
        languages: ['l1'],
        professions: ['p1'],
        skills: ['s1'],
        fieldsOfStudy: ['f1']
      },
      {
        id: "7",
        age: 1,
        experience: 1,
        educationLevel: "el1",
        languages: ['l1', 'l2'],
        professions: ['p1', 'p2'],
        skills: ['s1', 's2'],
        fieldsOfStudy: ['f1', 'f2']
      }
    ]
    return pipe(
      A.traverse(E.either)(getWeight)(candidates),
      E.map(weigths =>
        A.array.foldMap(MonoidSum)(weigths, (x) => x)
      ),
      // como el peso tiene que devolver 1 para todos los casos, es igual a la longitud de array
      E.bimap(
        _ => expect.fail(),
        r => expect(r).equals(candidates.length)
      )
    )
  })
})


