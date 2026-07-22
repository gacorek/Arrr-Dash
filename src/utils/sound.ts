// Synthesize pleasant modern notification chime using Web Audio API

export function playAlertSound(type: 'outage' | 'recovered' | 'test' = 'test') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (type === 'outage') {
      // Outage sound: two low warning pulses
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc1.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3); // A3

      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.3);

      // Second pulse
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(330, ctx.currentTime + 0.35);
      osc2.frequency.exponentialRampToValueAtTime(165, ctx.currentTime + 0.65);

      gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.35);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.65);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.65);

    } else if (type === 'recovered' || type === 'test') {
      // Recovery chime: bright ascending arpeggio (C5 -> E5 -> G5)
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.4);
      });
    }

  } catch (e) {
    console.warn('AudioContext disabled or unsupported', e);
  }
}
