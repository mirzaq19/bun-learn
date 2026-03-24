import { db } from '../src/db'
import { users, sessions } from '../src/db/schema'

export async function resetDatabase() {
  await db.delete(sessions)
  await db.delete(users)
}
