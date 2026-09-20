/**
 * Optional ambience, synthesised with the Web Audio API (nothing to download).
 * Off by default; the visitor turns it on with the sound button.
 */
class Ambience {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private built = false

  private ensure() {
    if (this.ctx) return this.ctx
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    try {
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0
      this.master.connect(this.ctx.destination)
    } catch {
      this.ctx = null
    }
    return this.ctx
  }

  setOn(on: boolean) {
    const c = this.ensure()
    if (!c || !this.master) return
    if (on) {
      if (c.state === 'suspended') void c.resume()
      if (!this.built) this.build(c)
      this.master.gain.cancelScheduledValues(c.currentTime)
      this.master.gain.linearRampToValueAtTime(0.5, c.currentTime + 2.5)
    } else {
      this.master.gain.cancelScheduledValues(c.currentTime)
      this.master.gain.linearRampToValueAtTime(0, c.currentTime + 0.8)
    }
  }

  private build(c: AudioContext) {
    if (!this.master) return
    this.built = true
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 420
    lp.connect(this.master)
    const voices: [number, number][] = [
      [55, 0.05],
      [82.4, 0.03],
      [110.3, 0.018],
      [164.9, 0.008],
    ]
    voices.forEach(([f, v], i) => {
      const o = c.createOscillator()
      const g = c.createGain()
      o.type = i % 2 ? 'triangle' : 'sine'
      o.frequency.value = f
      g.gain.value = v
      // slow swell so the pad breathes
      const lfo = c.createOscillator()
      const lg = c.createGain()
      lfo.frequency.value = 0.04 + i * 0.013
      lg.gain.value = v * 0.6
      lfo.connect(lg).connect(g.gain)
      lfo.start()
      o.connect(g).connect(lp)
      o.start()
    })
  }

  /** A soft, low tick when a panel opens. */
  tick() {
    const c = this.ctx
    if (!c || !this.master || this.master.gain.value < 0.05) return
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(420, c.currentTime)
    o.frequency.exponentialRampToValueAtTime(260, c.currentTime + 0.18)
    g.gain.setValueAtTime(0.0001, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.22)
    o.connect(g).connect(this.master)
    o.start()
    o.stop(c.currentTime + 0.25)
  }
}

export const ambience = new Ambience()
