import { MongoClient } from "mongodb";
import { RedisClient } from "redis";
declare const closeConnectionsAndExit: (redis?: RedisClient | undefined, mongo?: MongoClient | undefined) => Promise<void>;
export { closeConnectionsAndExit };
//# sourceMappingURL=shutdown.d.ts.map