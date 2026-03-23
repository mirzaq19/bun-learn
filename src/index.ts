import { Elysia } from 'elysia'
import { db } from './db'
import { users } from './db/schema'

const app = new Elysia()
  .get('/', () => 'Hello World')
  .get('/users', async () => {
    return await db.select().from(users)
  })
  .post('/users', async ({ body }) => {
    const { name, email } = body as { name: string; email: string }
    return await db.insert(users).values({ name, email })
  })
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
