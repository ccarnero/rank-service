import { MongoClient } from "mongodb";
import { RedisClient } from "redis";
import util from "util"

const closeConnectionsAndExit = async (redis?: RedisClient, mongo?: MongoClient) => {
    if (mongo && mongo.isConnected()) {
      console.error('MongoDb connected...')
      await mongo.close(false);
      console.error('MongoDb connection closed.');
    }
    if (redis && redis.connected) {
      const closeRedis = util.promisify(redis.quit).bind(redis);
      console.error('Redis connected...')
      await closeRedis();
      console.error('Redis connection closed.');
    };
    process.exit(1)
  };

export default closeConnectionsAndExit;

