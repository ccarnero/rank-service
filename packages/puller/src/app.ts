import redis, { RedisClient } from 'redis';
import { MongoClient, MongoClientOptions } from "mongodb";
import { GetOpportunitiesForCandidate, GetCandidate } from "./modules/mongo/mongodb";

import { pipe } from "fp-ts/function";
import { taskEither as TE } from "fp-ts";
import * as A from 'fp-ts/Array'

import { closeConnectionsAndExit, startHealthcheckServer } from "@ranker/commons";

import { Rank } from "@ranker/types"

const {
  MONGODB_URI = '',
  MONGODB_COLLECTION = '',
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
  const getCandidate = GetCandidate(MONGODB_COLLECTION, cnn.db());
  const getOpportunities = GetOpportunitiesForCandidate(MONGODB_COLLECTION, cnn.db());

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
    console.log(`connected to redis ${REDIS_URI}.
    * read: ${REDIS_READ_CHANNEL},
    * push: ${REDIS_PUSH_CHANNEL},
    * db: ${MONGODB_URI.substring(0, 10)}, 
    * collection: ${MONGODB_COLLECTION}`);
    
    subscriberClient.on('message', async (_redisChannel: string, message: string) => {
      console.log(`message ${message.substring(0, 10)}... arrived`)
      await pipe(
        getCandidate(message),
        TE.chain(
          await getOpportunities
        ),
        TE.chain(
          processAllMessages
        ),
        TE.bimap(
          (error:Error) => console.error({ message, error }),
          (score) => {
            const toScore = score
              .reduce((p, c) => p.concat(`(idCandidate: ${c.candidate.id}, idOpportunity: ${c.opportunity.id})`), '');
            console.log({ message, toScore })
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
