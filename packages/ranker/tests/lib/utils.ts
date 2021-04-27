
import { pipe } from "fp-ts/lib/function"
import * as E from "fp-ts/lib/Either"
import * as A from 'fp-ts/lib/Array'

import { calculate } from "../../src/modules/weigthCalculator/ranker"
import { expect } from "chai"
import { MonoidSum } from "fp-ts/lib/number"
import { Candidate } from "../../src/modules/types/candidate"
import { Opportunity } from "../../src/modules/types/opportunity"
import { Applicative2 } from "fp-ts/lib/Applicative"

// const assertArrayOfCandidates = (candidates: Candidate[], 
//   f:Applicative2<any>, 
//   expected: number) =>
//   pipe(
//     A.traverse(E.either)(f)(candidates),
//     E.map(weights => A.array.foldMap(MonoidSum)(weights, x => x)),
//     E.bimap(
//       _ => expect.fail(),
//       r => expect(r).equals(expected)
//     )
//   )