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
        name: t.String({ minLength: 1, maxLength: 255, examples: ['John Doe'] }),
        email: t.String({ format: 'email', maxLength: 255, examples: ['john@example.com'] }),
        password: t.String({ minLength: 6, maxLength: 255, examples: ['password123'] }),
      }),
      response: {
        200: t.Object({
          data: t.String({ examples: ['OK'] }),
        }),
        400: t.Object({
          error: t.String({ examples: ['Terjadi kesalahan'] }),
        }),
        409: t.Object({
          error: t.String({ examples: ['Email sudah terdaftar'] }),
        }),
      },
      detail: {
        tags: ['Users'],
        summary: 'Register a new user',
      },
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
        email: t.String({ format: 'email', maxLength: 255, examples: ['john@example.com'] }),
        password: t.String({ maxLength: 255, examples: ['password123'] }),
      }),
      response: {
        200: t.Object({
          data: t.String({ examples: ['uuid-token-string'] }),
        }),
        401: t.Object({
          error: t.String({ examples: ['Email atau password salah'] }),
        }),
      },
      detail: {
        tags: ['Users'],
        summary: 'Login and generate session token',
      },
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
    },
    {
      response: {
        200: t.Object({
          data: t.Object({
            id: t.Integer({ examples: [1] }),
            name: t.String({ examples: ['John Doe'] }),
            email: t.String({ examples: ['john@example.com'] }),
            createdAt: t.Any({ examples: ['2024-03-24T00:00:00.000Z'] }),
          }),
        }),
        401: t.Object({
          error: t.String({ examples: ['Unauthorized'] }),
        }),
      },
      detail: {
        tags: ['Users'],
        summary: 'Get current authorized user info',
        security: [{ BearerAuth: [] }],
      },
    }
  )
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
    },
    {
      response: {
        200: t.Object({
          data: t.String({ examples: ['OK'] }),
        }),
        401: t.Object({
          error: t.String({ examples: ['Unauthorized'] }),
        }),
      },
      detail: {
        tags: ['Users'],
        summary: 'Logout and invalidate session token',
        security: [{ BearerAuth: [] }],
      },
    }
  )
