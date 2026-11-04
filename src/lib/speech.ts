const TTS_PREFIX = 'tts:'

/** True when the backend sent text for the browser to read aloud instead of an audio file. */
export const isTextToSpeech = (audioUrl?: string | null): audioUrl is string =>
  !!audioUrl && audioUrl.startsWith(TTS_PREFIX)

export const textOf = (audioUrl: string) => audioUrl.slice(TTS_PREFIX.length)

/** Reads Chinese text aloud with the browser's speech synthesis. Returns false when it is unavailable. */
export function speakChinese(text: string, onEnd: () => void, onError: () => void): boolean {
  if (!('speechSynthesis' in window)) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text.replace(/[(（].*?[)）]/g, '').trim())
  utterance.lang = 'zh-CN'
  utterance.rate = 0.85
  utterance.onend = onEnd
  utterance.onerror = onError
  window.speechSynthesis.speak(utterance)
  return true
}

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}
