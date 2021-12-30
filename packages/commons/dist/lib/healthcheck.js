"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopHealthcheckServer = exports.startHealthcheckServer = void 0;
const fastify_1 = __importDefault(require("fastify"));
const { HEALTHCHECK_PORT = 3000 } = process.env;
const server = (0, fastify_1.default)({});
const startHealthcheckServer = async () => {
    server.get('/healthcheck', async (request, reply) => 'pong\n');
    server.listen(HEALTHCHECK_PORT, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.info(`HTTP healthcheck listening at: http://localhost:${address}/healthcheck`);
    });
    return server;
};
exports.startHealthcheckServer = startHealthcheckServer;
const stopHealthcheckServer = async () => {
    console.info(`stopping healthcheck listenning`);
    server.close();
};
exports.stopHealthcheckServer = stopHealthcheckServer;
//# sourceMappingURL=healthcheck.js.map