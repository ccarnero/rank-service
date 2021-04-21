import { taskEither as TE } from "fp-ts";
import { Db } from "mongodb";

const SaveScoring = (db: Db) =>
  (idCandidate: string, idOpportunity: string) =>
    (score: number): TE.TaskEither<Error, number> =>
      TE.tryCatch(
        async () => {
          const collection = db.collection('candidateOpportunityScoring');
          await collection.findOneAndUpdate({ idCandidate, idOpportunity },
            { $set: { score } },
            { upsert: true }
          )
          return score
        },
        (reason) => new Error(`${reason}`)
      )

export default SaveScoring;
