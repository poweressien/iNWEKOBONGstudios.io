/**
 * All sound is synthesised with the Web Audio API — no files to download,
 * nothing to license, and it costs zero bytes on the wire.
 */
class Sfx {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private enabled = false
  private hum: { osc: OscillatorNode; gain: GainNode } | null = null
  private lastStep = 0

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    try {
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.9
      this.master.connect(this.ctx.destination)
    } catch {
      this.ctx = null
    }
    return this.ctx
  }

  /** Must be called from a real user gesture (the PLAY button) to satisfy autoplay rules. */
  unlock() {
    const c = this.ensure()
    if (c && c.state === 'suspended') void c.resume()
  }

  setEnabled(on: boolean) {
    this.enabled = on
    if (!on) this.ambient(false)
  }

  private tone(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number, delay = 0) {
    if (!this.enabled) return
    const c = this.ensure()
    if (!c || !this.master) return
    const t0 = c.currentTime + delay
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur)
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(g).connect(this.master)
    osc.start(t0)
    osc.stop(t0 + dur + 0.03)
  }

  click() {
    this.tone(720, 0.07, 'square', 0.035)
  }
  open() {
    this.tone(380, 0.14, 'triangle', 0.06, 760)
  }
  close() {
    this.tone(620, 0.12, 'triangle', 0.05, 320)
  }
  step() {
    const now = performance.now()
    if (now - this.lastStep < 230) return
    this.lastStep = now
    this.tone(70 + Math.random() * 25, 0.07, 'triangle', 0.035)
  }
  dash() {
    this.tone(220, 0.2, 'sawtooth', 0.035, 900)
  }
  pickup(n: number) {
    const base = 520 * Math.pow(1.122, n % 8)
    this.tone(base, 0.1, 'triangle', 0.07)
    this.tone(base * 1.5, 0.16, 'triangle', 0.06, undefined, 0.07)
  }
  levelUp() {
    ;[523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 'square', 0.045, undefined, i * 0.09))
  }
  trophy() {
    ;[784, 988, 1175].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.07, undefined, i * 0.08))
  }
  pad(i: number) {
    this.tone(160 + i * 70, 0.18, 'square', 0.06, 90 + i * 40)
  }
  honk() {
    this.tone(330, 0.16, 'sawtooth', 0.06)
    this.tone(415, 0.16, 'sawtooth', 0.05)
    this.tone(330, 0.22, 'sawtooth', 0.06, undefined, 0.2)
    this.tone(415, 0.22, 'sawtooth', 0.05, undefined, 0.2)
  }
  warp() {
    this.tone(120, 0.5, 'sawtooth', 0.05, 1400)
  }
  message() {
    this.tone(880, 0.06, 'sine', 0.05)
    this.tone(1175, 0.09, 'sine', 0.04, undefined, 0.05)
  }

  ambient(on: boolean) {
    const c = this.ensure()
    if (!c || !this.master) return
    if (on && this.enabled && !this.hum) {
      const osc = c.createOscillator()
      const g = c.createGain()
      osc.type = 'sine'
      osc.frequency.value = 55
      g.gain.setValueAtTime(0.0001, c.currentTime)
      g.gain.linearRampToValueAtTime(0.018, c.currentTime + 1.5)
      osc.connect(g).connect(this.master)
      osc.start()
      this.hum = { osc, gain: g }
    } else if (!on && this.hum) {
      const { osc, gain } = this.hum
      gain.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.5)
      setTimeout(() => {
        try {
          osc.stop()
        } catch {
          /* already stopped */
        }
      }, 600)
      this.hum = null
    }
  }
}

export const sfx = new Sfx()
