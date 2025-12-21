import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET
)

const TOKEN_NAME = 'auth-token'
const TOKEN_DURATION = 30 * 24 * 60 * 60

export async function createToken(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)

  return token
}

export async function verifyToken(token) {
  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload
  } catch (err) {
    return null
  }
}

export async function setAuthCookie(userId, email) {
  const token = await createToken({ userId, email })
  
  const cookieStore = cookies()
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_DURATION,
    path: '/'
  })

  return token
}

export async function getAuthUser() {
  const cookieStore = cookies()
  const token = cookieStore.get(TOKEN_NAME)

  if (!token) return null

  return await verifyToken(token.value)
}

export async function removeAuthCookie() {
  const cookieStore = cookies()
  cookieStore.delete(TOKEN_NAME)
}

export function getClientToken() {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(c => c.trim().startsWith(`${TOKEN_NAME}=`))
  
  if (!tokenCookie) return null
  
  return tokenCookie.split('=')[1]
}
