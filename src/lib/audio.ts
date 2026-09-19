/**
 * All sound here is synthesized with the Web Audio API rather than loaded
 * from files — that means it works the moment you unzip the project, with
 * nothing to source or license. If you'd rather use real recordings, swap
 * the bodies of these functions for `new Audio('/audio/whatever.mp3').play()`
 * and drop files in /public/audio.
 */
class AudioManager {
  private ctx: AudioContext | null = null
  private enabled = false
  private ambientGain: GainNode | null = null
  private ambientOsc: OscillatorNode | null = null
  private lastFootstep = 0

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    this.ctx = new AC()
    return this.ctx
  }

  /** Call this from a real user gesture (the Explore button) to satisfy autoplay policies. */
  unlock() {
    const ctx = this.ensureContext()
    if (ctx && ctx.state === 'suspended') void ctx.resume()
  }

  setEnabled(v: boolean) {
    this.enabled = v
    if (!v) this.setAmbient(false)
  }

  private blip(freq: number, duration: number, type: OscillatorType, gainPeak: number) {
    if (!this.enabled) return
    const ctx = this.ensureContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(gainPeak, ctx.currentTime + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration + 0.02)
  }

  footstep() {
    const now = performance.now()
    if (now - this.lastFootstep < 260) return
    this.lastFootstep = now
    this.blip(90 + Math.random() * 20, 0.09, 'triangle', 0.05)
  }

  doorOpen() {
    this.blip(180, 0.35, 'sine', 0.08)
  }

  doorClose() {
    this.blip(120, 0.25, 'sine', 0.07)
  }

  uiClick() {
    this.blip(660, 0.08, 'square', 0.04)
  }

  computerOn() {
    this.blip(320, 0.5, 'sawtooth', 0.05)
  }

  setAmbient(on: boolean) {
    const ctx = this.ensureContext()
    if (!ctx) return
    if (on && !this.ambientOsc && this.enabled) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 48
      gain.gain.value = 0.0
      gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 1.2)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      this.ambientOsc = osc
      this.ambientGain = gain
    } else if (!on && this.ambientOsc && this.ambientGain) {
      const osc = this.ambientOsc
      const gain = this.ambientGain
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6)
      setTimeout(() => osc.stop(), 700)
      this.ambientOsc = null
      this.ambientGain = null
    }
  }
}

export const audioManager = new AudioManager()
