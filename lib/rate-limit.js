const attempts = new Map()

const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  COOLDOWN_MS: 60 * 1000,
  CLEANUP_INTERVAL: 5 * 60 * 1000
}

setInterval(() => {
  const now = Date.now()
  for (const [key, data] of attempts.entries()) {
    if (now - data.lastAttempt > RATE_LIMIT.CLEANUP_INTERVAL) {
      attempts.delete(key)
    }
  }
}, RATE_LIMIT.CLEANUP_INTERVAL)

export function checkRateLimit(identifier) {
  const now = Date.now()
  const data = attempts.get(identifier)

  if (!data) {
    attempts.set(identifier, {
      count: 1,
      lastAttempt: now,
      blockedUntil: null
    })
    return { allowed: true, remainingAttempts: RATE_LIMIT.MAX_ATTEMPTS - 1 }
  }

  if (data.blockedUntil && now < data.blockedUntil) {
    const secondsRemaining = Math.ceil((data.blockedUntil - now) / 1000)
    return {
      allowed: false,
      remainingAttempts: 0,
      cooldownSeconds: secondsRemaining,
      message: `Muitas tentativas. Tente novamente em ${secondsRemaining} segundos.`
    }
  }

  if (data.blockedUntil && now >= data.blockedUntil) {
    attempts.set(identifier, {
      count: 1,
      lastAttempt: now,
      blockedUntil: null
    })
    return { allowed: true, remainingAttempts: RATE_LIMIT.MAX_ATTEMPTS - 1 }
  }

  data.count += 1
  data.lastAttempt = now

  if (data.count >= RATE_LIMIT.MAX_ATTEMPTS) {
    data.blockedUntil = now + RATE_LIMIT.COOLDOWN_MS
    attempts.set(identifier, data)
    return {
      allowed: false,
      remainingAttempts: 0,
      cooldownSeconds: 60,
      message: 'Muitas tentativas. Tente novamente em 60 segundos.'
    }
  }

  attempts.set(identifier, data)
  return {
    allowed: true,
    remainingAttempts: RATE_LIMIT.MAX_ATTEMPTS - data.count
  }
}

export function resetRateLimit(identifier) {
  attempts.delete(identifier)
}
