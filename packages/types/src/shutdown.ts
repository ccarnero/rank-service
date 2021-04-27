import { MongoClient } from "mongodb";
import { RedisClient } from "redis";
import { promisify } from "util"

const closeConnectionsAndExit = async (redis?: RedisClient, mongo?: MongoClient) : Promise<void> => {
    if (mongo && mongo.isConnected()) {
      console.error('MongoDb connected...')
      await mongo.close(false);
      console.error('MongoDb connection closed.');
    }
    if (redis && redis.connected) {
      const closeRedis = promisify(redis.quit).bind(redis);
      console.error('Redis connected...')
      await closeRedis();
      console.error('Redis connection closed.');
    };
    process.exit(1)
  };

export { closeConnectionsAndExit };

