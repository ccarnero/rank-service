import redis from 'redis';
import closeConnectionsAndExit from './shutdown'

const getRedisClient = (redisUrl:string)=> {
  const redisClient = redis.createClient(redisUrl);

  redisClient.on('error', reason => {
    console.error(`Redis Error: ${reason.message}`);
    return closeConnectionsAndExit(redisClient)
  })

  return redisClient;
}

export default getRedisClient;
