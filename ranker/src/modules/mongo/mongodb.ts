import { taskEither as TE } from "fp-ts";
import { pipe } from "fp-ts/function";
import { Db, co } from "mongodb";

const SaveScoring = (db: Db) =>
  (idCandidate: string, idOpportunity: string) =>
    (score: number): TE.TaskEither<Error, number> =>
      TE.tryCatch(
        async () => {
          const collection = db.collection('candidateOpportunityScoring.find');
          await collection.updateOne({ idCandidate, idOpportunity },
            { $set: { score } },
            { upsert: true }
          )
          return score
        },
        (reason) => new Error(`${reason}`)
      )

export default SaveScoring;
