// Pronunciation uses the device's own Spanish voice, so it works offline and
// needs no recordings.

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

function spanishVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'es-ES') ??
    voices.find((v) => v.lang.toLowerCase().startsWith('es')) ??
    null
  );
}

/**
 * By default an iPhone silences a web page's speech while the ring switch is
 * on silent. Declaring the audio as playback asks it to treat a tap on the
 * speaker like a video or a game, which play regardless. Browsers without
 * this setting ignore it.
 */
function requestPlayback() {
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
  if (!session) return;
  try {
    session.type = 'playback';
  } catch {
    // Not supported for this kind of audio; speech falls back to the default.
  }
}

/**
 * A second nudge for the same problem. An audio element is media, which an
 * iPhone plays even on silent, so a silent clip is kept playing for as long as
 * the voice speaks, to hold the page's audio in that mode.
 */
let carrier: HTMLAudioElement | null = null;

function silentClip() {
  // Half a second of silence as an 8 kHz, 8-bit mono WAV, built here so no file is needed.
  const samples = 4000;
  const bytes = new Uint8Array(44 + samples).fill(128);
  const view = new DataView(bytes.buffer);
  const text = (at: number, s: string) => [...s].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + samples, true);
  text(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true);
  view.setUint32(28, 8000, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  text(36, 'data');
  view.setUint32(40, samples, true);
  return URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
}

function holdPlayback() {
  try {
    if (!carrier) {
      carrier = new Audio(silentClip());
      carrier.loop = true;
      carrier.setAttribute('playsinline', '');
    }
    void carrier.play().catch(() => {});
  } catch {
    // No audio element available; speech carries on without it.
  }
}

const releasePlayback = () => carrier?.pause();

export function speak(text: string) {
  if (!canSpeak) return;
  requestPlayback();
  holdPlayback();
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  const voice = spanishVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 0.9;
  utterance.onend = releasePlayback;
  utterance.onerror = releasePlayback;
  synth.speak(utterance);
}
