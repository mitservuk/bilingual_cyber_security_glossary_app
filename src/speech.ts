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

export function speak(text: string) {
  if (!canSpeak) return;
  requestPlayback();
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  const voice = spanishVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 0.9;
  synth.speak(utterance);
}
