import { Elysia, t } from 'elysia'
import { usersService } from '../services/users-service'

export const usersRoute = new Elysia({ prefix: '/api/users' })
  .post(
    '',
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
  .post(
    '/login',
    async ({ body, set }) => {
      try {
        return await usersService.loginUser(body)
      } catch (error: any) {
        set.status = 401
        return { error: error.message || 'Email atau password salah' }
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
      }),
    }
  )
  .derive(({ headers }) => {
    const authHeader = headers['authorization']
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { token: null }
    }
    return { token: authHeader.replace('Bearer ', '') }
  })
  .get('/current', async ({ token, set }) => {
    if (!token) {
      set.status = 401
      return { error: 'Unauthorized' }
    }

    try {
      return await usersService.getCurrentUser(token)
    } catch (error: any) {
      set.status = 401
      return { error: 'Unauthorized' }
    }
  })
  .delete('/logout', async ({ token, set }) => {
    if (!token) {
      set.status = 401
      return { error: 'Unauthorized' }
    }

    try {
      return await usersService.logoutUser(token)
    } catch (error: any) {
      set.status = 401
      return { error: 'Unauthorized' }
    }
  })
