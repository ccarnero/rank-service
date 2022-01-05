import redis, { RedisClient } from 'redis';
import { MongoClient, MongoClientOptions } from "mongodb";

import { pipe } from "fp-ts/function";
import { taskEither as TE } from "fp-ts";
import * as A from 'fp-ts/Array'

import { closeConnectionsAndExit, startHealthcheckServer, stopHealthcheckServer } from "@ranker/commons";
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

let mongoClient: MongoClient;
let subscriberClient:RedisClient, publisherClient:RedisClient;

const main = async () => {
  mongoClient = new MongoClient(MONGODB_URI, options);
  await mongoClient.connect();

  debug(`===> isCandidate: ${isCandidate()}`)
  const candidatesPull = isCandidate() ? getCandidatesFromCandidate(mongoClient.db()) : getCandidatesFromOpportunity(mongoClient.db())
  const opportunitiesPull = isCandidate() ? getOpportunitiesFromCandidate(mongoClient.db()) : getOpportuniesFromOpportunity(mongoClient.db())
  const getRankTupleListFromDb = getRankTupleList(candidatesPull)(opportunitiesPull);

  const publisherClient = redis.createClient(REDIS_URI);
  const publishToRanker = publisher(REDIS_PUSH_CHANNEL, publisherClient)

  const processAllMessages = (ranks: Array<Rank>) => pipe(
    ranks,
    A.map(publishToRanker),
    TE.sequenceArray
  )
  subscriberClient = redis.createClient(REDIS_URI);
  subscriberClient.subscribe(REDIS_READ_CHANNEL);

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

startHealthcheckServer()
  .then(main)
  .catch(async (error:Error) => {
    console.error(`Error: ${error.message}`);
    closeConnectionsAndExit(subscriberClient, mongoClient);
    closeConnectionsAndExit(publisherClient, mongoClient);
    await stopHealthcheckServer();
    process.exit(2);
  });

