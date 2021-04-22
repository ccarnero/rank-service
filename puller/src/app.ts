import redis, { RedisClient } from 'redis';
import { MongoClient, MongoClientOptions } from "mongodb";
import { GetOpportunitiesForCandidate, GetCandidate } from "./modules/mongo/mongodb";

import { pipe } from "fp-ts/function";
import { taskEither as TE } from "fp-ts";
import * as A from 'fp-ts/Array'
import Run from "./modules/web/healthcheck"

const {
  MONGODB_URI,
  MONGODB_COLLECTION,
  REDIS_URI,
  REDIS_READ_CHANNEL,
  REDIS_PUSH_CHANNEL
} = process.env

const options: MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true }

const publisher = (channel: string, redisClient: RedisClient) => (
  message =>
    TE.tryCatch(
      async () => {
        await redisClient.publish(channel, JSON.stringify(message))
        console.log(`idCandidate: ${message.candidate.id}, idOpportunity: ${message.opportunity.id} published`)
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

  const processAllMessages = (ranks) => pipe(
    ranks,
    A.map(publishToRanker),
    TE.sequenceArray
  )

  const subscriberClient = redis.createClient(REDIS_URI);
  subscriberClient.subscribe(REDIS_READ_CHANNEL);
  subscriberClient.on('connect', () => {
    console.log('connected to redis')
    subscriberClient.on('message', async (_redisChannel: string, message: string) => {
      console.log('message', message)
      await pipe(
        getCandidate(message),
        TE.chain(
          await getOpportunities
        ),
        TE.chain(
          processAllMessages
        ),
        TE.bimap(
          (error) => console.log({ message, error }),
          (score) => console.error({ message, score })
        )
      )();
    })
  }
  );
}

main()
  .then(() => Run())
  .catch(console.error);
