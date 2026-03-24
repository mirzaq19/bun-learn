import { describe, it, expect, beforeEach } from 'bun:test'
import { resetDatabase } from './helper'

const BASE_URL = 'http://localhost:3000/api'

describe('Users API', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  describe('POST /api/users (Registration)', () => {
    it('should register a new user successfully', async () => {
      const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      })

      const body = await response.json()
      expect(response.status).toBe(200)
      expect(body.data).toBe('OK')
    })

    it('should fail if email is already registered', async () => {
      const payload = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }

      await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const body = await response.json()
      expect(response.status).toBe(409)
      expect(body.error).toBe('Email sudah terdaftar')
    })

    it('should fail with invalid email format', async () => {
      const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        }),
      })

      expect(response.status).toBe(422)
    })

    it('should fail if name exceeds 255 characters', async () => {
      const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'A'.repeat(300),
          email: 'test@example.com',
          password: 'password123',
        }),
      })

      expect(response.status).toBe(422)
    })
  })

  describe('POST /api/users/login', () => {
    it('should login successfully with valid credentials', async () => {
      const payload = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }

      await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const response = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
        }),
      })

      const body = await response.json()
      expect(response.status).toBe(200)
      expect(body.data).toBeDefined()
    })

    it('should fail with invalid credentials', async () => {
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        }),
      })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/users/current', () => {
    it('should get current user profile with valid token', async () => {
      const payload = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }

      await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const loginRes = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
        }),
      })

      const { data: token } = await loginRes.json()

      const response = await fetch(`${BASE_URL}/users/current`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const body = await response.json()
      expect(response.status).toBe(200)
      expect(body.data.email).toBe(payload.email)
    })

    it('should fail without authorization header', async () => {
      const response = await fetch(`${BASE_URL}/users/current`)
      expect(response.status).toBe(401)
    })
  })

  describe('DELETE /api/users/logout', () => {
    it('should logout successfully', async () => {
      const payload = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }

      await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const loginRes = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
        }),
      })

      const { data: token } = await loginRes.json()

      const response = await fetch(`${BASE_URL}/users/logout`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      expect(response.status).toBe(200)

      // Verify token is gone
      const currentRes = await fetch(`${BASE_URL}/users/current`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      expect(currentRes.status).toBe(401)
    })

    it('should fail on double logout', async () => {
      const payload = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }

      await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const loginRes = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
        }),
      })

      const { data: token } = await loginRes.json()

      await fetch(`${BASE_URL}/users/logout`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const response = await fetch(`${BASE_URL}/users/logout`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      expect(response.status).toBe(401)
    })
  })
})
