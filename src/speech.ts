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

export function speak(text: string) {
  if (!canSpeak) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  const voice = spanishVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 0.9;
  synth.speak(utterance);
}
