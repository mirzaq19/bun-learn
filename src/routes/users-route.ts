import { Elysia, t } from 'elysia'
import { usersService } from '../services/users-service'

export const usersRoute = new Elysia({ prefix: '/api/users' })
  .post(
    '/',
    async ({ body, set }) => {
      try {
        return await usersService.registerUser(body)
      } catch (error: any) {
        if (error.message === 'Email sudah terdaftar') {
          set.status = 409
          return { error: error.message }
        }
        set.status = 400
        return { error: error.message || 'Terjadi kesalahan' }
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 6 }),
      }),
    }
  )
