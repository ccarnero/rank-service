import { ChangeStream, MongoClient, MongoClientOptions } from "mongodb";
import redis, { ClientOpts } from 'redis';

import GetMongodbStream from "./modules/GetMongodbStream";
import StartHealthcheckEndpoint from "./modules/healthcheck"

import getRedisClient from "./modules/redis";
import closeConnectionsAndExit from "./modules/shutdown";

// const CHANGES_TTL = 30000;
// TODO: recolectar informacion del mismo objectid por una ventana de tiempo
// esto es util cuando el candidato esta editando su perfil

const {
  MONGODB_URI = '',
  MONGODB_COLLECTION = '',
  MONGODB_WATCH_PROPERTIES = 'lastModified,likeTheseOpportunities',
  REDIS_URI = '',
  REDIS_PUSH_CHANNEL = '',

} = process.env

const toFind: Array<string> = MONGODB_WATCH_PROPERTIES.split(',');

const mongodbOptions: MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true }
const mongoClient: MongoClient = new MongoClient(MONGODB_URI, mongodbOptions);
const redisClient = getRedisClient(REDIS_URI);
StartHealthcheckEndpoint();

const main = async () => {
  await mongoClient.connect();
  const stream: ChangeStream<any> = await GetMongodbStream(MONGODB_COLLECTION, toFind, mongoClient.db())

  while (await stream.hasNext()) {
    const { id } = await stream.next();
    await redisClient.publish(REDIS_PUSH_CHANNEL, id);
  }
}

main()
  .catch(error => {
    console.error(`Error: ${error.message}`);
    closeConnectionsAndExit(redisClient, mongoClient);
  });
