import { db } from '../db'
import { users, sessions } from '../db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export const usersService = {
  async registerUser(payload: typeof users.$inferInsert) {
    // 1. Check if user with email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1)

    if (existingUser) {
      throw new Error('Email sudah terdaftar')
    }

    // 2. Hash password using Bun's native bcrypt
    const hashedPassword = await Bun.password.hash(payload.password, {
      algorithm: 'bcrypt',
      cost: 10,
    })

    // 3. Insert user into database
    await db.insert(users).values({
      ...payload,
      password: hashedPassword,
    })

    return { data: 'OK' }
  },

  async loginUser(payload: Pick<typeof users.$inferInsert, 'email' | 'password'>) {
    // 1. Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1)

    if (!user) {
      throw new Error('Email atau password salah')
    }

    // 2. Verify password
    const isPasswordValid = await Bun.password.verify(payload.password, user.password)

    if (!isPasswordValid) {
      throw new Error('Email atau password salah')
    }

    // 3. Generate session token (UUID)
    const token = randomUUID()

    // 4. Save session to database
    await db.insert(sessions).values({
      token,
      userId: user.id,
    })

    return { data: token }
  },

  async getCurrentUser(token: string) {
    // 1. Find session and join with users table
    const [result] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token))
      .limit(1)

    if (!result) {
      throw new Error('Unauthorized')
    }

    return { data: result }
  },
}
