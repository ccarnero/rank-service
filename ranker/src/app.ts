import redis from 'redis';
import { MongoClient, MongoClientOptions } from "mongodb";
import SaveScoring from "./modules/mongo/mongodb";

import { pipe } from "fp-ts/function";
import { taskEither as TE } from "fp-ts";
import { calculate } from './modules/weigthCalculator/ranker';
import { Rank } from './modules/types/rank';

const MONGODB_URI: string = `${process.env.MONGODB_URI}`

const REDIS_URI: string = 'redis://localhost:6379'
const REDIS_READ_CHANNEL: string = 'ranker';

const options: MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true }

const main = async () => {
  const cnn: MongoClient = new MongoClient(MONGODB_URI, options);
  await cnn.connect();
  const SaveScoreConnection = SaveScoring(cnn.db());

  const subscriber = redis.createClient(REDIS_URI);
  subscriber.subscribe(REDIS_READ_CHANNEL);

  subscriber.on('connect', () => {
    console.log('connected to redis')
    subscriber.on('message', async (_redisChannel: string, message: string) => {
      const rank: Rank = JSON.parse(message);
      const {
        candidate: {
          id: idCandidate
        },
        opportunity: {
          id: idOpportunity
        }
      } = rank;
      const SaveScore = SaveScoreConnection(idCandidate, idOpportunity)
      pipe(
        TE.fromEither(calculate(rank)),
        TE.chain(score => SaveScore(score)),
        TE.bimap(
          (error) => console.log({ idCandidate, idOpportunity, error }),
          (score) => console.error({ idCandidate, idOpportunity, score })
        )
      )()
    })
  }
  );
}

main().catch(console.error);