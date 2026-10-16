class AudioAlertService {
  private isMuted: boolean = false;
  private audioCtx: AudioContext | null = null;

  constructor() {
    const saved = localStorage.getItem('autopulse_audio_muted');
    this.isMuted = saved === 'true';
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('autopulse_audio_muted', String(muted));
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
  }

  public playChime(type: 'warning' | 'critical' | 'success' = 'warning') {
    if (this.isMuted) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      if (type === 'critical') {
        // High urgency 2-tone chime
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.setValueAtTime(1046.5, now + 0.12); // C6
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'warning') {
        // Caution single pulse
        osc.frequency.setValueAtTime(587.33, now); // D5
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        // Pleasant success chime
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public speak(text: string) {
    if (this.isMuted) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Stop prior queue
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Ignore speech failure
      }
    }
  }

  public announceHazard(hazardType: string, distanceMeters: number) {
    this.playChime('critical');
    const cleanType = hazardType.replace(/_/g, ' ');
    const msg = `Caution. ${cleanType} detected ${Math.round(distanceMeters)} meters ahead.`;
    this.speak(msg);
  }
}

export const audioAlerts = new AudioAlertService();
