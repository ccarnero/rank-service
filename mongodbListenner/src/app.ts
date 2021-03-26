import { MongoClient, MongoClientOptions } from "mongodb";
import { deserialize, serialize } from 'typescript-json-serializer';

import GetMongodbStream from "./modules/GetMongodbStream";
import CandidateDocumentEvent from './types/CandidateRankEvent';
import { RankDocumentEvent } from "./types/RankDocumentEvent";

const uri: string = `${process.env.MONGODB_URI}`
const options:MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true }

const toFind = ['lastModified', 'likeTheseOpportunities'];
const collection = 'candidates';

const main = async () => {
  const cnn:MongoClient = new MongoClient(uri, options);
  await cnn.connect();

  const stream = await GetMongodbStream(collection, toFind, cnn.db())
  while( await stream.hasNext()) {
    const { id } = await stream.next();
    const candidate:RankDocumentEvent = new CandidateDocumentEvent(id);

    console.log( serialize( candidate ));
  }
}


main().catch(console.error);
