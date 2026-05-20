import { createEvent } from '../booking'

export function createEventRoute(fastify) {
  fastify.post('/events', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'totalSeats'],
        properties: {
          name: { type: 'string' },
          totalSeats: { type: 'integer' }
        }
      }
    },
    async handler(request, reply) {
      const { name, totalSeats } = request.body
      const eventId = await createEvent(fastify.db, name, totalSeats)

      return reply.status(200).send({ success: true, eventId })
    }
  })
}
