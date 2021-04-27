"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startHealthcheckServer = void 0;
const fastify_1 = __importDefault(require("fastify"));
const { HEALTHCHECK_PORT = 3000 } = process.env;
const startHealthcheckServer = async () => {
    const server = fastify_1.default();
    server.get('/healthcheck', async (request, reply) => 'pong\n');
    server.listen(HEALTHCHECK_PORT, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`HTTP healthcheck listening at port: ${address}`);
    });
};
exports.startHealthcheckServer = startHealthcheckServer;
//# sourceMappingURL=healthcheck.js.map