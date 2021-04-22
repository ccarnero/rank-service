import fastify from 'fastify'

const {
  HEALTHCHECK_PORT = 3000
} = process.env

const server = fastify()

server.get('/healthcheck', async (request, reply) => {
  return 'pong\n'
})

const Run = () =>
  server.listen(HEALTHCHECK_PORT, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })

export default Run;
