import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

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
}
