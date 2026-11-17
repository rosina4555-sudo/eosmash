export type SfxName =
  | 'ui_move'
  | 'ui_select'
  | 'countdown'
  | 'go'
  | 'whoosh_light'
  | 'whoosh_heavy'
  | 'hit_light'
  | 'hit_heavy'
  | 'block'
  | 'ko'
  | 'victory'
  | 'defeat'

interface ToneOptions {
  freq: number
  dur: number
  type: OscillatorType
  gain: number
  freq2?: number
  delay?: number
}

class AudioManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private musicGain: GainNode | null = null
  private noiseBuffer: AudioBuffer | null = null
  private musicStarted = false
  private volumes = { master: 0.9, sfx: 0.8, music: 0.5 }

  ensure(): boolean {
    if (!this.ctx) {
      const w = window as Window & { webkitAudioContext?: typeof AudioContext }
      const Ctor = window.AudioContext ?? w.webkitAudioContext
      if (!Ctor) return false
      try {
        this.ctx = new Ctor()
      } catch {
        return false
      }
      this.masterGain = this.ctx.createGain()
      this.masterGain.connect(this.ctx.destination)
      this.sfxGain = this.ctx.createGain()
      this.sfxGain.connect(this.masterGain)
      this.musicGain = this.ctx.createGain()
      this.musicGain.connect(this.masterGain)
      this.applyVolumes()
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
    return true
  }

  setVolumes(master: number, sfx: number, music: number) {
    this.volumes = { master, sfx, music }
    this.applyVolumes()
  }

  private applyVolumes() {
    if (!this.ctx) return
    this.masterGain?.gain.setTargetAtTime(this.volumes.master, this.ctx.currentTime, 0.02)
    this.sfxGain?.gain.setTargetAtTime(this.volumes.sfx, this.ctx.currentTime, 0.02)
    this.musicGain?.gain.setTargetAtTime(this.volumes.music, this.ctx.currentTime, 0.02)
  }

  play(name: SfxName) {
    if (!this.ensure() || !this.ctx || !this.sfxGain) return
    switch (name) {
      case 'ui_move':
        this.tone({ freq: 660, dur: 0.04, type: 'square', gain: 0.08 })
        break
      case 'ui_select':
        this.tone({ freq: 880, dur: 0.06, type: 'square', gain: 0.1 })
        this.tone({ freq: 1320, dur: 0.08, type: 'square', gain: 0.1, delay: 0.05 })
        break
      case 'countdown':
        this.tone({ freq: 523.25, dur: 0.12, type: 'sine', gain: 0.15 })
        break
      case 'go':
        this.tone({ freq: 784, dur: 0.18, type: 'sine', gain: 0.18 })
        this.tone({ freq: 1046.5, dur: 0.24, type: 'sine', gain: 0.12, delay: 0.06 })
        break
      case 'whoosh_light':
        this.noise(0.09, 0.1, 'highpass', 2000)
        break
      case 'whoosh_heavy':
        this.noise(0.16, 0.16, 'lowpass', 900)
        break
      case 'hit_light':
        this.noise(0.07, 0.2, 'lowpass', 1500)
        this.tone({ freq: 180, dur: 0.06, type: 'sine', gain: 0.2 })
        break
      case 'hit_heavy':
        this.noise(0.12, 0.28, 'lowpass', 900)
        this.tone({ freq: 90, dur: 0.1, type: 'sine', gain: 0.3 })
        break
      case 'block':
        this.noise(0.08, 0.18, 'bandpass', 3000)
        break
      case 'ko':
        this.tone({ freq: 220, freq2: 60, dur: 0.45, type: 'sawtooth', gain: 0.2 })
        this.noise(0.2, 0.15, 'lowpass', 600)
        break
      case 'victory':
        this.tone({ freq: 523.25, dur: 0.12, type: 'square', gain: 0.1 })
        this.tone({ freq: 659.25, dur: 0.12, type: 'square', gain: 0.1, delay: 0.12 })
        this.tone({ freq: 784, dur: 0.12, type: 'square', gain: 0.1, delay: 0.24 })
        this.tone({ freq: 1046.5, dur: 0.2, type: 'square', gain: 0.1, delay: 0.36 })
        break
      case 'defeat':
        this.tone({ freq: 392, dur: 0.14, type: 'triangle', gain: 0.12 })
        this.tone({ freq: 330, dur: 0.14, type: 'triangle', gain: 0.12, delay: 0.15 })
        this.tone({ freq: 262, dur: 0.22, type: 'triangle', gain: 0.12, delay: 0.3 })
        break
    }
  }

  startMusic() {
    if (this.musicStarted || !this.ensure() || !this.ctx || !this.musicGain) return
    this.musicStarted = true

    const ctx = this.ctx
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 500
    filter.Q.value = 0.8
    filter.connect(this.musicGain)

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.08
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 140
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)
    lfo.start()

    for (const [freq, level] of [
      [110, 0.03],
      [130.81, 0.024],
      [164.81, 0.024],
      [220, 0.015],
    ] as const) {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = freq
      osc.detune.value = (Math.random() - 0.5) * 8
      const gain = ctx.createGain()
      gain.gain.value = level
      osc.connect(gain)
      gain.connect(filter)
      osc.start()
    }
  }

  private tone(opts: ToneOptions) {
    if (!this.ctx || !this.sfxGain) return
    const ctx = this.ctx
    const start = ctx.currentTime + (opts.delay ?? 0)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = opts.type
    osc.frequency.setValueAtTime(opts.freq, start)
    if (opts.freq2) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.freq2), start + opts.dur)
    }
    gain.gain.setValueAtTime(opts.gain, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + opts.dur)
    osc.connect(gain)
    gain.connect(this.sfxGain)
    osc.start(start)
    osc.stop(start + opts.dur + 0.02)
  }

  private noise(dur: number, gainValue: number, type: BiquadFilterType, freq: number) {
    if (!this.ctx || !this.sfxGain) return
    const ctx = this.ctx
    if (!this.noiseBuffer) {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1
      }
      this.noiseBuffer = buffer
    }
    const source = ctx.createBufferSource()
    source.buffer = this.noiseBuffer
    const filter = ctx.createBiquadFilter()
    filter.type = type
    filter.frequency.value = freq
    const gain = ctx.createGain()
    const start = ctx.currentTime
    gain.gain.setValueAtTime(gainValue, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.sfxGain)
    source.start(start)
    source.stop(start + dur + 0.02)
  }
}

export const audio = new AudioManager()
