class EmergencyAudio {
  private ctx: AudioContext | null = null;
  private muted = false;

  /** Command-centre mute: silenced cues never even build an oscillator. */
  setMuted(value: boolean) {
    this.muted = value;
  }

  isMuted(): boolean {
    return this.muted;
  }

  private initCtx() {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playSosChirp() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  playPoliceSiren(durationSeconds = 2.5) {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const now = this.ctx.currentTime;
      const cycles = Math.floor(durationSeconds / 0.6);

      for (let i = 0; i < cycles; i++) {
        const t = now + i * 0.6;
        osc.frequency.setValueAtTime(650, t);
        osc.frequency.linearRampToValueAtTime(950, t + 0.3);
        osc.frequency.linearRampToValueAtTime(650, t + 0.6);
      }

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + durationSeconds);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durationSeconds);
    } catch {
      // Audio fallback
    }
  }

  playDispatchBeep() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(1050, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // fallback
    }
  }
}

export const emergencyAudio = new EmergencyAudio();
