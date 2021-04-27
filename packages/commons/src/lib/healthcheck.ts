import fastify from 'fastify'

const {
  HEALTHCHECK_PORT = 3000
} = process.env

const startHealthcheckServer = async (): Promise<void> => {
  const server = fastify()
  server.get('/healthcheck', async (request, reply) => 'pong\n')

  server.listen(HEALTHCHECK_PORT, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`HTTP healthcheck listening at port: ${address}`)
  })
}

export { startHealthcheckServer };
