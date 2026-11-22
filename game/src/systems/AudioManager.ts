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
  | 'hurt_light'
  | 'hurt_heavy'
  | 'effort_light'
  | 'effort_heavy'
  | 'scream_ko'
  | 'ko'
  | 'jump'
  | 'land'
  | 'victory'
  | 'defeat'
  | 'meter_full'
  | 'power_special'

interface ToneOpts {
  type: OscillatorType
  f1: number
  f2?: number
  dur: number
  gain: number
  attack?: number
  delay?: number
  lp?: number
  send?: number
}

interface NoiseOpts {
  dur: number
  gain: number
  type?: BiquadFilterType
  freq: number
  freqEnd?: number
  q?: number
  attack?: number
  delay?: number
  send?: number
}

interface VoiceOpts {
  dur: number
  fStart: number
  fEnd?: number
  gain: number
  formants: readonly [number, number, number]
  breath?: number
  attack?: number
  delay?: number
  vibratoHz?: number
  vibratoDepth?: number
  send?: number
}

// 100 BPM loop, 4 bars of A minor roots
const STEP_DUR = 60 / 100 / 4
const BAR_ROOTS = [55, 43.65, 49, 55]

class AudioManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private musicGain: GainNode | null = null
  private spaceIn: GainNode | null = null
  private noiseBuffer: AudioBuffer | null = null

  volumeMaster = 0.8
  volumeSfx = 0.9
  volumeMusic = 0.32

  private musicStarted = false
  private musicTimer: ReturnType<typeof setInterval> | null = null
  private nextStepTime = 0
  private musicStep = 0
  private musicBar = 0
  private padNodes: OscillatorNode[] = []

  private rand(min: number, max: number): number {
    return min + Math.random() * (max - min)
  }

  ensure(): AudioContext {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctor()
      this.ctx = ctx

      const compressor = ctx.createDynamicsCompressor()
      compressor.threshold.value = -16
      compressor.ratio.value = 5
      compressor.knee.value = 20
      compressor.attack.value = 0.003
      compressor.release.value = 0.18
      compressor.connect(ctx.destination)

      const shaper = ctx.createWaveShaper()
      shaper.curve = this.saturationCurve()
      shaper.oversample = '2x'
      shaper.connect(compressor)

      const master = ctx.createGain()
      master.gain.value = this.volumeMaster
      master.connect(shaper)
      this.masterGain = master

      const sfx = ctx.createGain()
      sfx.gain.value = this.volumeSfx
      sfx.connect(master)
      this.sfxGain = sfx

      const music = ctx.createGain()
      music.gain.value = this.volumeMusic
      music.connect(master)
      this.musicGain = music

      // Shared space bus: feedback delay = cheap room tail for impacts/vocals
      const spaceIn = ctx.createGain()
      const delay = ctx.createDelay(0.5)
      delay.delayTime.value = 0.085
      const damp = ctx.createBiquadFilter()
      damp.type = 'lowpass'
      damp.frequency.value = 3400
      const fb = ctx.createGain()
      fb.gain.value = 0.3
      const wet = ctx.createGain()
      wet.gain.value = 0.55
      spaceIn.connect(delay)
      delay.connect(damp)
      damp.connect(fb)
      fb.connect(delay)
      damp.connect(wet)
      wet.connect(sfx)
      this.spaceIn = spaceIn

      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
      this.noiseBuffer = buffer
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  private saturationCurve() {
    const n = 1024
    const curve = new Float32Array(n)
    const k = 2.5
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1
      curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x))
    }
    return curve
  }

  private sendTo(node: AudioNode, amount: number) {
    if (!this.ctx || !this.spaceIn || amount <= 0) return
    const g = this.ctx.createGain()
    g.gain.value = amount
    node.connect(g)
    g.connect(this.spaceIn)
  }

  private tone(opts: ToneOpts) {
    const ctx = this.ensure()
    const sfx = this.sfxGain
    if (!sfx) return
    const t0 = ctx.currentTime + (opts.delay ?? 0)
    const attack = opts.attack ?? 0.004

    const osc = ctx.createOscillator()
    osc.type = opts.type
    osc.frequency.setValueAtTime(opts.f1, t0)
    if (opts.f2 !== undefined) osc.frequency.linearRampToValueAtTime(opts.f2, t0 + opts.dur * 0.9)

    let node: AudioNode = osc
    if (opts.lp !== undefined) {
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = opts.lp
      osc.connect(lp)
      node = lp
    }

    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, t0)
    env.gain.linearRampToValueAtTime(opts.gain, t0 + attack)
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur)
    node.connect(env)
    env.connect(sfx)
    this.sendTo(env, opts.send ?? 0)

    osc.start(t0)
    osc.stop(t0 + opts.dur + 0.05)
  }

  private noise(opts: NoiseOpts) {
    const ctx = this.ensure()
    const sfx = this.sfxGain
    if (!sfx || !this.noiseBuffer) return
    const t0 = ctx.currentTime + (opts.delay ?? 0)
    const attack = opts.attack ?? 0.002

    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    src.loop = true
    src.playbackRate.value = this.rand(0.9, 1.15)

    const filter = ctx.createBiquadFilter()
    filter.type = opts.type ?? 'bandpass'
    filter.frequency.setValueAtTime(opts.freq, t0)
    if (opts.freqEnd !== undefined) {
      filter.frequency.linearRampToValueAtTime(opts.freqEnd, t0 + opts.dur)
    }
    filter.Q.value = opts.q ?? 1

    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, t0)
    env.gain.linearRampToValueAtTime(opts.gain, t0 + attack)
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur)

    src.connect(filter)
    filter.connect(env)
    env.connect(sfx)
    this.sendTo(env, opts.send ?? 0)

    src.start(t0)
    src.stop(t0 + opts.dur + 0.05)
  }

  // Formant (vocal tract) synthesis: saw glottal source through 3 bandpass
  // formants + breath noise. Cheap but reads as a real voice, MK grunt style.
  private voice(opts: VoiceOpts) {
    const ctx = this.ensure()
    const sfx = this.sfxGain
    if (!sfx) return
    const t0 = ctx.currentTime + (opts.delay ?? 0) + this.rand(0, 0.025)
    const attack = opts.attack ?? 0.01
    const fEnd = opts.fEnd ?? opts.fStart * 0.7
    const breath = opts.breath ?? 0.3
    const [fm1, fm2, fm3] = opts.formants
    const formantGains = [1, 0.5, 0.22]
    const formantQs = [9, 11, 13]
    const formants = [fm1, fm2, fm3]

    const mix = ctx.createGain()
    mix.gain.value = 1

    // Glottal source
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(opts.fStart, t0)
    osc.frequency.linearRampToValueAtTime(fEnd, t0 + opts.dur * 0.92)

    if (opts.vibratoHz !== undefined && opts.vibratoDepth) {
      const lfo = ctx.createOscillator()
      lfo.type = 'sine'
      lfo.frequency.value = opts.vibratoHz
      const depth = ctx.createGain()
      depth.gain.value = opts.vibratoDepth
      lfo.connect(depth)
      depth.connect(osc.frequency)
      lfo.start(t0)
      lfo.stop(t0 + opts.dur + 0.05)
    }

    for (let i = 0; i < 3; i++) {
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = formants[i]
      bp.Q.value = formantQs[i]
      const g = ctx.createGain()
      g.gain.value = formantGains[i]
      osc.connect(bp)
      bp.connect(g)
      g.connect(mix)
    }

    // Breath through the same vocal tract (broad band around F1/F2)
    if (breath > 0 && this.noiseBuffer) {
      const nsrc = ctx.createBufferSource()
      nsrc.buffer = this.noiseBuffer
      nsrc.loop = true
      nsrc.playbackRate.value = this.rand(0.9, 1.1)
      const nbp = ctx.createBiquadFilter()
      nbp.type = 'bandpass'
      nbp.frequency.value = (fm1 + fm2) / 2
      nbp.Q.value = 1.4
      const ng = ctx.createGain()
      ng.gain.value = breath
      nsrc.connect(nbp)
      nbp.connect(ng)
      ng.connect(mix)
      nsrc.start(t0)
      nsrc.stop(t0 + opts.dur + 0.05)
    }

    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, t0)
    env.gain.linearRampToValueAtTime(opts.gain, t0 + attack)
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur)
    mix.connect(env)
    env.connect(sfx)
    this.sendTo(env, opts.send ?? 0)

    osc.start(t0)
    osc.stop(t0 + opts.dur + 0.05)
  }

  play(name: SfxName) {
    switch (name) {
      case 'ui_move':
        this.tone({ type: 'triangle', f1: 660, dur: 0.06, gain: 0.06, attack: 0.002 })
        break
      case 'ui_select':
        this.tone({ type: 'triangle', f1: 740, f2: 1480, dur: 0.14, gain: 0.1, attack: 0.003 })
        this.tone({ type: 'sine', f1: 185, f2: 370, dur: 0.14, gain: 0.06, delay: 0.015 })
        break
      case 'countdown':
        this.tone({ type: 'square', f1: 523, dur: 0.09, gain: 0.09, attack: 0.002 })
        this.tone({ type: 'triangle', f1: 130, dur: 0.12, gain: 0.07 })
        this.noise({ dur: 0.03, gain: 0.08, freq: 3000, type: 'highpass' })
        break
      case 'go':
        this.tone({ type: 'square', f1: 392, f2: 784, dur: 0.2, gain: 0.12, attack: 0.002 })
        this.tone({ type: 'square', f1: 784, f2: 1568, dur: 0.2, gain: 0.06, delay: 0.01 })
        this.tone({ type: 'triangle', f1: 98, f2: 196, dur: 0.25, gain: 0.1 })
        this.noise({ dur: 0.05, gain: 0.1, freq: 4000, type: 'highpass', send: 0.2 })
        break

      case 'whoosh_light':
        this.noise({
          dur: 0.12,
          gain: 0.14,
          freq: 800,
          freqEnd: 2600,
          q: 1.6,
          attack: 0.03,
          send: 0.12,
        })
        break
      case 'whoosh_heavy':
        this.noise({
          dur: 0.17,
          gain: 0.19,
          freq: 500,
          freqEnd: 2000,
          q: 1.8,
          attack: 0.05,
          send: 0.16,
        })
        break

      // MK-style light: transient crack + wet flesh slap + short body thump
      case 'hit_light':
        this.noise({ dur: 0.02, gain: 0.45, freq: 3500, type: 'highpass', attack: 0.001 })
        this.noise({
          dur: 0.055,
          gain: 0.5,
          freq: this.rand(2500, 2900),
          freqEnd: 950,
          q: 3,
          attack: 0.001,
          send: 0.2,
        })
        this.tone({ type: 'sine', f1: this.rand(195, 225), f2: 70, dur: 0.08, gain: 0.45, send: 0.1 })
        break

      // MK-style heavy: bone-crunch micro-bursts + wet thwack + sub boom
      case 'hit_heavy': {
        for (let i = 0; i < 3; i++) {
          this.noise({
            dur: 0.022,
            gain: [0.4, 0.34, 0.28][i],
            freq: this.rand(1800, 2600),
            type: 'highpass',
            attack: 0.001,
            delay: [0, 0.014, 0.032][i],
            send: 0.04,
          })
        }
        this.noise({
          dur: 0.09,
          gain: 0.5,
          freq: 2400,
          freqEnd: 500,
          q: 1.2,
          attack: 0.002,
          send: 0.22,
        })
        this.tone({ type: 'sine', f1: this.rand(125, 145), f2: 42, dur: 0.22, gain: 0.7, send: 0.3 })
        this.noise({ dur: 0.3, gain: 0.2, freq: 160, type: 'lowpass', delay: 0.03, attack: 0.01, send: 0.1 })
        break
      }

      // Block: forearm thock + metallic guard sparks + tonal ring
      case 'block':
        this.tone({ type: 'sine', f1: 320, f2: 190, dur: 0.05, gain: 0.3, send: 0.08 })
        this.noise({ dur: 0.04, gain: 0.4, freq: 4100, q: 6, attack: 0.001, send: 0.1 })
        this.noise({ dur: 0.05, gain: 0.3, freq: 5500, q: 7, attack: 0.001, delay: 0.012, send: 0.1 })
        this.tone({ type: 'sine', f1: 950, f2: 520, dur: 0.09, gain: 0.15 })
        break

      // Defender pain grunts (formant voice, randomized each hit)
      case 'hurt_light':
        if (Math.random() < 0.5) {
          this.voice({
            dur: this.rand(0.11, 0.15),
            fStart: this.rand(165, 190),
            fEnd: 110,
            gain: 0.16,
            formants: [530, 1840, 2480],
            breath: 0.32,
            attack: 0.006,
            vibratoHz: 6,
            vibratoDepth: 4,
          })
        } else {
          this.voice({
            dur: this.rand(0.12, 0.16),
            fStart: this.rand(150, 175),
            fEnd: 102,
            gain: 0.15,
            formants: [520, 1190, 2390],
            breath: 0.36,
            attack: 0.006,
            vibratoHz: 5.5,
            vibratoDepth: 3,
          })
        }
        break
      case 'hurt_heavy':
        if (Math.random() < 0.5) {
          this.voice({
            dur: this.rand(0.3, 0.42),
            fStart: this.rand(240, 280),
            fEnd: 125,
            gain: 0.24,
            formants: [730, 1090, 2440],
            breath: 0.3,
            attack: 0.012,
            vibratoHz: 5.5,
            vibratoDepth: 10,
            send: 0.15,
          })
        } else {
          this.voice({
            dur: this.rand(0.28, 0.38),
            fStart: this.rand(210, 250),
            fEnd: 112,
            gain: 0.22,
            formants: [530, 1840, 2480],
            breath: 0.36,
            attack: 0.012,
            vibratoHz: 6,
            vibratoDepth: 8,
            send: 0.15,
          })
        }
        break

      // Attacker effort on swing
      case 'effort_light':
        this.voice({
          dur: this.rand(0.09, 0.13),
          fStart: this.rand(155, 175),
          fEnd: 120,
          gain: 0.1,
          formants: [730, 1090, 2440],
          breath: 0.55,
          attack: 0.008,
        })
        break
      case 'effort_heavy':
        this.voice({
          dur: this.rand(0.2, 0.28),
          fStart: this.rand(200, 230),
          fEnd: 135,
          gain: 0.15,
          formants: [730, 1090, 2440],
          breath: 0.4,
          attack: 0.012,
          vibratoHz: 5,
          vibratoDepth: 6,
        })
        break

      // Death scream when health hits zero
      case 'scream_ko':
        this.voice({
          dur: this.rand(0.85, 1.05),
          fStart: this.rand(380, 460),
          fEnd: this.rand(135, 160),
          gain: 0.3,
          formants: [730, 1090, 2440],
          breath: 0.28,
          attack: 0.03,
          vibratoHz: 6.5,
          vibratoDepth: 16,
          send: 0.3,
        })
        break

      // Match-ending blow: full crunch + crash + long sub drop
      case 'ko': {
        for (let i = 0; i < 4; i++) {
          this.noise({
            dur: 0.025,
            gain: [0.45, 0.4, 0.34, 0.28][i],
            freq: this.rand(1600, 2500),
            type: 'highpass',
            attack: 0.001,
            delay: [0, 0.015, 0.034, 0.055][i],
            send: 0.05,
          })
        }
        this.noise({
          dur: 0.35,
          gain: 0.5,
          freq: 1800,
          freqEnd: 400,
          attack: 0.002,
          send: 0.25,
        })
        this.tone({ type: 'sine', f1: 150, f2: 30, dur: 0.55, gain: 0.85, send: 0.4 })
        this.noise({ dur: 0.5, gain: 0.22, freq: 140, type: 'lowpass', delay: 0.03, attack: 0.01, send: 0.15 })
        break
      }

      case 'jump':
        this.noise({ dur: 0.09, gain: 0.08, freq: 900, freqEnd: 2200, q: 2, attack: 0.02 })
        this.tone({ type: 'sine', f1: 170, f2: 250, dur: 0.1, gain: 0.06 })
        break
      case 'land':
        this.tone({ type: 'sine', f1: 160, f2: 58, dur: 0.13, gain: 0.42, send: 0.12 })
        this.noise({ dur: 0.07, gain: 0.2, freq: 2200, freqEnd: 900, q: 2, attack: 0.002, send: 0.1 })
        break

      case 'victory':
        this.tone({ type: 'triangle', f1: 523.25, dur: 0.12, gain: 0.11, attack: 0.01 })
        this.tone({ type: 'triangle', f1: 659.25, dur: 0.12, gain: 0.11, delay: 0.11, attack: 0.01 })
        this.tone({ type: 'triangle', f1: 783.99, dur: 0.12, gain: 0.11, delay: 0.22, attack: 0.01 })
        this.tone({ type: 'triangle', f1: 1046.5, dur: 0.4, gain: 0.12, delay: 0.33, attack: 0.01, send: 0.25 })
        this.tone({ type: 'sine', f1: 523.25, dur: 0.5, gain: 0.05, delay: 0.33 })
        this.noise({ dur: 0.06, gain: 0.07, freq: 7000, type: 'highpass', delay: 0.55, attack: 0.01 })
        break
      case 'defeat':
        this.tone({ type: 'sawtooth', f1: 392, f2: 330, dur: 0.3, gain: 0.08, attack: 0.02, lp: 1600, send: 0.2 })
        this.tone({ type: 'sawtooth', f1: 349.2, f2: 294, dur: 0.35, gain: 0.08, delay: 0.25, attack: 0.02, lp: 1400, send: 0.2 })
        this.tone({ type: 'sawtooth', f1: 294, f2: 220, dur: 0.4, gain: 0.09, delay: 0.55, attack: 0.02, lp: 1200, send: 0.25 })
        this.tone({ type: 'sine', f1: 110, f2: 55, dur: 0.9, gain: 0.1, delay: 0.55, send: 0.3 })
        break

      case 'meter_full':
        this.tone({ type: 'triangle', f1: 523, f2: 784, dur: 0.12, gain: 0.1, attack: 0.01 })
        this.tone({ type: 'triangle', f1: 784, f2: 1046, dur: 0.14, gain: 0.11, delay: 0.1, attack: 0.01 })
        this.tone({ type: 'sine', f1: 1046, f2: 1568, dur: 0.28, gain: 0.09, delay: 0.2, attack: 0.01, send: 0.3 })
        this.noise({ dur: 0.08, gain: 0.06, freq: 5000, type: 'highpass', delay: 0.2, attack: 0.01 })
        break
      case 'power_special':
        this.noise({
          dur: 0.28,
          gain: 0.2,
          freq: 500,
          freqEnd: 3200,
          q: 1.4,
          attack: 0.02,
          send: 0.35,
        })
        this.tone({ type: 'sawtooth', f1: 180, f2: 420, dur: 0.22, gain: 0.14, attack: 0.01, lp: 2200, send: 0.25 })
        this.tone({ type: 'sine', f1: 90, f2: 40, dur: 0.5, gain: 0.55, delay: 0.04, send: 0.4 })
        this.noise({ dur: 0.2, gain: 0.18, freq: 180, type: 'lowpass', delay: 0.08, attack: 0.01, send: 0.2 })
        break
    }
  }

  setVolumes(master: number, sfx: number, music: number) {
    this.setMasterVolume(master)
    this.setSfxVolume(sfx)
    this.setMusicVolume(music)
  }

  setMasterVolume(v: number) {
    this.volumeMaster = v
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.02)
    }
  }

  setSfxVolume(v: number) {
    this.volumeSfx = v
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.02)
    }
  }

  setMusicVolume(v: number) {
    this.volumeMusic = v
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.02)
    }
  }

  startMusic() {
    const ctx = this.ensure()
    if (this.musicStarted) return
    this.musicStarted = true

    const pad = ctx.createGain()
    pad.gain.value = 0.45

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 650
    filter.Q.value = 1.2

    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.12
    const lfoDepth = ctx.createGain()
    lfoDepth.gain.value = 200
    lfo.connect(lfoDepth)
    lfoDepth.connect(filter.frequency)
    lfo.start()
    this.padNodes.push(lfo)

    const roots = [110, 87.31, 98, 110]
    roots.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const g = ctx.createGain()
      g.gain.value = 0.12
      osc.connect(g)
      g.connect(pad)
      osc.start(ctx.currentTime + i * 1.6)
      this.padNodes.push(osc)

      const osc2 = ctx.createOscillator()
      osc2.type = 'triangle'
      osc2.frequency.value = freq * 1.004
      const g2 = ctx.createGain()
      g2.gain.value = 0.09
      osc2.connect(g2)
      g2.connect(pad)
      osc2.start(ctx.currentTime + i * 1.6)
      this.padNodes.push(osc2)
    })

    pad.connect(filter)
    if (this.musicGain) filter.connect(this.musicGain)

    this.nextStepTime = ctx.currentTime + 0.1
    this.musicStep = 0
    this.musicBar = 0
    this.musicTimer = setInterval(() => this.scheduleMusic(), 40)
  }

  stopMusic() {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer)
      this.musicTimer = null
    }
    this.musicStarted = false
  }

  private scheduleMusic() {
    const ctx = this.ctx
    if (!ctx || !this.musicStarted) return
    while (this.nextStepTime < ctx.currentTime + 0.25) {
      this.scheduleStep(this.musicStep, this.nextStepTime)
      this.nextStepTime += STEP_DUR
      this.musicStep += 1
      if (this.musicStep >= 16) {
        this.musicStep = 0
        this.musicBar = (this.musicBar + 1) % BAR_ROOTS.length
      }
    }
  }

  private scheduleStep(step: number, time: number) {
    const ctx = this.ctx
    if (!ctx || !this.musicGain) return

    if (step % 4 === 0) {
      this.musicKick(time)
      this.musicSub(BAR_ROOTS[this.musicBar], time)
    }
    if (step === 4 || step === 12) this.musicClap(time)
    if (step % 2 === 0) this.musicHat(time)
  }

  private musicKick(time: number) {
    const ctx = this.ctx
    if (!ctx || !this.musicGain) return
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, time)
    osc.frequency.exponentialRampToValueAtTime(46, time + 0.09)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.55, time)
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.13)
    osc.connect(g)
    g.connect(this.musicGain)
    osc.start(time)
    osc.stop(time + 0.15)
  }

  private musicClap(time: number) {
    const ctx = this.ctx
    if (!ctx || !this.musicGain || !this.noiseBuffer) return
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1700
    bp.Q.value = 1.4
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.3, time)
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.09)
    src.connect(bp)
    bp.connect(g)
    g.connect(this.musicGain)
    src.start(time)
    src.stop(time + 0.1)
  }

  private musicHat(time: number) {
    const ctx = this.ctx
    if (!ctx || !this.musicGain || !this.noiseBuffer) return
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    src.playbackRate.value = 1.7
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 7500
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.07, time)
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.03)
    src.connect(hp)
    hp.connect(g)
    g.connect(this.musicGain)
    src.start(time)
    src.stop(time + 0.04)
  }

  private musicSub(freq: number, time: number) {
    const ctx = this.ctx
    if (!ctx || !this.musicGain) return
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, time)
    g.gain.linearRampToValueAtTime(0.3, time + 0.02)
    g.gain.exponentialRampToValueAtTime(0.001, time + STEP_DUR * 4 * 0.9)
    osc.connect(g)
    g.connect(this.musicGain)
    osc.start(time)
    osc.stop(time + STEP_DUR * 4)
  }
}

export const audio = new AudioManager()
