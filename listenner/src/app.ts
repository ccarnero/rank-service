import { ChangeStream, MongoClient, MongoClientOptions } from "mongodb";
import redis from 'redis';

import GetMongodbStream from "./modules/GetMongodbStream";
import Run from "./modules/healthcheck"

// const CHANGES_TTL = 30000;
// TODO: recolectar informacion del mismo objectid por una ventana de tiempo
// esto es util cuando el candidato esta editando su perfil

const mongodbOptions: MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true }

const {
  MONGODB_URI = '',
  REDIS_URI = '',
  REDIS_PUSH_CHANNEL = ''
} = process.env

const toFind: Array<string> = ['lastModified', 'likeTheseOpportunities'];
const mongodbCollection: string = 'candidates';

const main = async () => {
  const cnn: MongoClient = new MongoClient(MONGODB_URI, mongodbOptions);
  await cnn.connect();

  const stream: ChangeStream<any> = await GetMongodbStream(mongodbCollection, toFind, cnn.db())
  const publisher = redis.createClient(REDIS_URI);

  Run();
  while (await stream.hasNext()) {
    const { id } = await stream.next();
    await publisher.publish(REDIS_PUSH_CHANNEL, id);
  }
}

main().catch(console.error);
