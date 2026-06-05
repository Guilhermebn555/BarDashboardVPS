let audioCtx = null
let desbloqueado = false

export function garantirAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (Ctx) audioCtx = new Ctx()
  }
  return audioCtx
}

export function registrarDesbloqueioAudio() {
  if (typeof window === 'undefined' || desbloqueado) return

  const desbloquear = () => {
    const ctx = garantirAudioContext()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})

    try {
      const buffer = ctx.createBuffer(1, 1, 22050)
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)
      source.start(0)
    } catch (e) {}

    desbloqueado = true
    window.removeEventListener('pointerdown', desbloquear)
    window.removeEventListener('keydown', desbloquear)
    window.removeEventListener('touchstart', desbloquear)
  }

  window.addEventListener('pointerdown', desbloquear)
  window.addEventListener('keydown', desbloquear)
  window.addEventListener('touchstart', desbloquear)
}

export function tocarPlin() {
  const ctx = garantirAudioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  const agora = ctx.currentTime
  const tocarNota = (freq, start, dur) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, agora + start)
    gain.gain.setValueAtTime(0.0001, agora + start)
    gain.gain.exponentialRampToValueAtTime(0.35, agora + start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, agora + start + dur)
    osc.connect(gain).connect(ctx.destination)
    osc.start(agora + start)
    osc.stop(agora + start + dur + 0.05)
  }
  tocarNota(1046, 0, 0.18)
  tocarNota(1318, 0.12, 0.25)
}