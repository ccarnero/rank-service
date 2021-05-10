import redis, { RedisClient } from 'redis';
import { MongoClient, MongoClientOptions } from "mongodb";

import { pipe } from "fp-ts/function";
import { taskEither as TE } from "fp-ts";
import * as A from 'fp-ts/Array'

import { closeConnectionsAndExit, startHealthcheckServer } from "@ranker/commons";
import { Rank } from "@ranker/types"
import { getCandidatesFromCandidate, getCandidatesFromOpportunity, getOpportuniesFromOpportunity, getOpportunitiesFromCandidate, getRankTupleList, isCandidate } from './modules/rankFactory';

const debug = require('debug')('verbose');

const {
  MONGODB_URI = '',
  REDIS_URI = '',
  REDIS_READ_CHANNEL = '',
  REDIS_PUSH_CHANNEL = ''
} = process.env

const options: MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true }

const publisher = (channel: string, redisClient: RedisClient) => (
  (message: Rank) =>
    TE.tryCatch(
      async () => {
        await redisClient.publish(channel, JSON.stringify(message))
        return message
      },
      (reason) => new Error(`${reason}`),
    )
)


const main = async () => {
  const cnn: MongoClient = new MongoClient(MONGODB_URI, options);
  await cnn.connect();

  debug(`===> isCandidate: ${isCandidate()}`)
  const candidatesPull = isCandidate() ? getCandidatesFromCandidate(cnn.db()) : getCandidatesFromOpportunity(cnn.db())
  const opportunitiesPull = isCandidate() ? getOpportunitiesFromCandidate(cnn.db()) : getOpportuniesFromOpportunity(cnn.db())
  const getRankTupleListFromDb = getRankTupleList(candidatesPull)(opportunitiesPull);

  const publisherClient = redis.createClient(REDIS_URI);
  const publishToRanker = publisher(REDIS_PUSH_CHANNEL, publisherClient)

  const processAllMessages = (ranks: Array<Rank>) => pipe(
    ranks,
    A.map(publishToRanker),
    TE.sequenceArray
  )

  const subscriberClient = redis.createClient(REDIS_URI);
  subscriberClient.subscribe(REDIS_READ_CHANNEL);

  startHealthcheckServer();

  subscriberClient.on('connect', () => {
    debug(`connected to redis ${REDIS_URI}.
    * read: ${REDIS_READ_CHANNEL},
    * push: ${REDIS_PUSH_CHANNEL},
    * db: ${MONGODB_URI.substring(0, 10)}`);
    
    subscriberClient.on('message', async (_redisChannel: string, message: string) => {
      debug(`message ${message.substring(0, 10)}... arrived`)
      await pipe(
        getRankTupleListFromDb(message),
        TE.chain(processAllMessages),
        TE.bimap(
          (error:Error) => console.error({ message, error }),
          (score) => {
            const toScore = score
              .reduce((p, c) => p.concat(`(idCandidate: ${c.candidate.id}, idOpportunity: ${c.opportunity.id})`), '');
            debug({ message, toScore })
          }
        )
      )();
    })
  }
  );
}

main()
  .catch((error) => {
    console.error(error);
    closeConnectionsAndExit();
  });
