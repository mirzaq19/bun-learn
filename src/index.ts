import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { usersRoute } from './routes/users-route'

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Bun Learn API Documentation',
          version: '1.0.0',
          description: 'API Documentation for User Services',
        },
        tags: [{ name: 'Users', description: 'User management endpoints' }],
      },
    })
  )
  .get('/', () => 'Hello World')
  .use(usersRoute)
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
