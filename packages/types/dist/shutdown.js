"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeConnectionsAndExit = void 0;
const util_1 = require("util");
const closeConnectionsAndExit = async (redis, mongo) => {
    if (mongo && mongo.isConnected()) {
        console.error('MongoDb connected...');
        await mongo.close(false);
        console.error('MongoDb connection closed.');
    }
    if (redis && redis.connected) {
        const closeRedis = util_1.promisify(redis.quit).bind(redis);
        console.error('Redis connected...');
        await closeRedis();
        console.error('Redis connection closed.');
    }
    ;
    process.exit(1);
};
exports.closeConnectionsAndExit = closeConnectionsAndExit;
//# sourceMappingURL=shutdown.js.map