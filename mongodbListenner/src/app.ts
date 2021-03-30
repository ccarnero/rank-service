import { ChangeStream, MongoClient, MongoClientOptions } from "mongodb";
import redis from 'redis';
import GetMongodbStream from "./modules/GetMongodbStream";

// const CHANGES_TTL = 30000;
// TODO: recolectar informacion del mismo objectid por una ventana de tiempo
// esto es util cuando el candidato esta editando su perfil

const uri: string = `${process.env.MONGODB_URI}`
const options: MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true }

const toFind:Array<string> = ['lastModified', 'likeTheseOpportunities'];
const collection:string = 'candidates';

const redisUri:string = 'redis://localhost:6379'

const main = async () => {
  const cnn:MongoClient = new MongoClient(uri, options);
  await cnn.connect();

  const stream:ChangeStream<any> = await GetMongodbStream(collection, toFind, cnn.db())
  const publisher = redis.createClient(redisUri);
  while (await stream.hasNext()) {
      const { id } = await stream.next();
      await publisher.publish(collection, id);
  }
}

main().catch(console.error);
