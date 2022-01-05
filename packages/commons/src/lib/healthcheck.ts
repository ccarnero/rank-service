import Fastify, { fastify, FastifyInstance, RouteShorthandOptions } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'

const {
  HEALTHCHECK_PORT = 3000
} = process.env

const server: FastifyInstance = Fastify({})

const startHealthcheckServer = async (): Promise<FastifyInstance> => {
  server.get('/healthcheck', async (request, reply) => 'pong\n')

  server.listen(HEALTHCHECK_PORT, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.info(`HTTP healthcheck listening at: http://localhost:${address}/healthcheck`)
  })

  return server
}

const stopHealthcheckServer = async(): Promise<void> => {
  console.info(`stopping healthcheck listenning`)
  server.close();
};

export { startHealthcheckServer, stopHealthcheckServer };

