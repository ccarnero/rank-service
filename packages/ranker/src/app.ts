import redis from 'redis';

import { MongoClient, MongoClientOptions } from "mongodb";

const debug = require('debug')('verbose')

import { pipe } from "fp-ts/function";
import { taskEither as TE } from "fp-ts";
import { Rank } from "@ranker/types";
import { startHealthcheckServer, closeConnectionsAndExit } from "@ranker/commons"

import { calculate } from './modules/weigthCalculator/ranker';
import SaveScoring from "./modules/mongo/mongodb";

const {
  MONGODB_URI = '',
  REDIS_URI = '',
  REDIS_READ_CHANNEL= ''
} = process.env;

const options: MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true }

const main = async () => {
  const cnn: MongoClient = new MongoClient(MONGODB_URI, options);
  await cnn.connect();
  const SaveScoreConnection = SaveScoring(cnn.db());

  const subscriber = redis.createClient(REDIS_URI);
  subscriber.subscribe(REDIS_READ_CHANNEL);

  startHealthcheckServer();

  subscriber.on('connect', () => {
    debug(`connected to redis ${REDIS_URI}.
      * read: ${REDIS_READ_CHANNEL},
      * db: ${MONGODB_URI.substring(0,10)}`);

    subscriber.on('message', async (_redisChannel: string, message: string) => {
      debug(`Message received: ${JSON.stringify(message)}`);
      const rank:Rank = JSON.parse(message);
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
          (error) => console.error({ idCandidate, idOpportunity, error }),
          (score) => console.log({ idCandidate, idOpportunity, score })
        )
      )()
    })
  }
  );
}

main().catch(console.error);
