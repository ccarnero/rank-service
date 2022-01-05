import { ChangeStream, MongoClient, MongoClientOptions } from "mongodb";

import GetMongodbStream from "./modules/GetMongodbStream";

import getRedisClient from "./modules/redis";

import { closeConnectionsAndExit, startHealthcheckServer, stopHealthcheckServer } from "@ranker/commons";


// const CHANGES_TTL = 30000;
// TODO: recolectar informacion del mismo objectid por una ventana de tiempo
// esto es util cuando el candidato esta editando su perfil

const {
  MONGODB_URI = '',
  MONGODB_COLLECTION = '',
  MONGODB_WATCH_PROPERTIES = 'testRank',
  REDIS_URI = '',
  REDIS_PUSH_CHANNEL = '',

} = process.env

const toFind: Array<string> = MONGODB_WATCH_PROPERTIES.split(',');

const mongodbOptions: MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true }
const mongoClient: MongoClient = new MongoClient(MONGODB_URI, mongodbOptions);
const redisClient = getRedisClient(REDIS_URI);

const getMongoCollectionStream = async () => {
  console.log(JSON.stringify(process.env, null,2));

  await mongoClient.connect();
  const stream: ChangeStream<any> = await GetMongodbStream(MONGODB_COLLECTION, toFind, mongoClient.db())
  console.log(`connected to mongodb stream.`);
  
  while (await stream.hasNext()) {
    const { id } = await stream.next();
    console.log(`got message: ${id}`);

    await redisClient.publish(REDIS_PUSH_CHANNEL, id);
  }
}

startHealthcheckServer()
  .then(getMongoCollectionStream)
  .catch(async (error:Error) => {
    console.error(`Error: ${error.message}`);
    closeConnectionsAndExit(redisClient, mongoClient);
    await stopHealthcheckServer();
    process.exit(2);
  });
