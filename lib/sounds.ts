import { Howl } from 'howler';

class SoundManager {
  private sounds: Record<string, Howl>;
  private isMuted: boolean = false;

  constructor() {
    this.sounds = {
      place: new Howl({
        src: ['/sounds/place.mp3'],
        volume: 0.5,
      }),
      select: new Howl({
        src: ['/sounds/select.mp3'],
        volume: 0.3,
      }),
      win: new Howl({
        src: ['/sounds/win.mp3'],
        volume: 0.7,
      }),
      draw: new Howl({
        src: ['/sounds/draw.mp3'],
        volume: 0.5,
      }),
      flip: new Howl({
        src: ['/sounds/flip.mp3'],
        volume: 0.4,
      }),
      invalid: new Howl({
        src: ['/sounds/invalid.mp3'],
        volume: 0.3,
      }),
    };
  }

  play(sound: keyof typeof this.sounds): void {
    if (!this.isMuted) {
      this.sounds[sound].play();
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setMute(mute: boolean): void {
    this.isMuted = mute;
  }

  isSoundMuted(): boolean {
    return this.isMuted;
  }
}

// Create a singleton instance
export const soundManager = typeof window !== 'undefined' ? new SoundManager() : null;

// Utility function to safely play sounds (handles SSR)
export const playSound = (sound: string): void => {
  if (typeof window !== 'undefined' && soundManager) {
    soundManager.play(sound as any);
  }
};