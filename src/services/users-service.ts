import { db } from '../db'
import { users, sessions } from '../db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export const usersService = {
  /**
   * Mendaftarkan pengguna baru ke dalam sistem.
   * Fungsi ini mengecek apakah email sudah terdaftar, melakukan hashing pada password,
   * lalu menyimpan data pengguna baru tersebut ke dalam database.
   *
   * @param payload Data pengguna yang ingin didaftarkan (nama, email, password)
   * @returns Object dengan pesan berhasil jika sukses mendaftar
   */
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

  /**
   * Melakukan proses otentikasi (login) pengguna.
   * Fungsi ini memvalidasi kecocokan email dan password, 
   * kemudian membuat dan menyimpan token sesi baru jika kredensial valid.
   *
   * @param payload Kredensial atau data login pengguna (email dan password)
   * @returns Object yang berisi token sesi otentikasi
   */
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

  /**
   * Mengambil data profil pengguna yang saat ini sedang login.
   * Fungsi ini memverifikasi token sesi dan mengambil data pengguna terkait dari database.
   *
   * @param token Token sesi otentikasi yang sedang aktif
   * @returns Object berisi informasi profil pengguna (id, name, email, createdAt)
   */
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

  /**
   * Mengeluarkan pengguna dari sistem (logout).
   * Fungsi ini akan menghapus token sesi aktif dari database sehingga tidak dapat digunakan lagi.
   *
   * @param token Token sesi otentikasi yang ingin dihapus
   * @returns Object dengan pesan berhasil jika token telah dihapus
   */
  async logoutUser(token: string) {
    // 1. Delete session from database
    const [result]: any = await db.delete(sessions).where(eq(sessions.token, token))

    if (result.affectedRows === 0) {
      throw new Error('Unauthorized')
    }

    return { data: 'OK' }
  },
}
