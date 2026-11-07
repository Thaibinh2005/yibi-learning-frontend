let context: AudioContext | null = null

/** A short tone after each answer, generated in the browser so no audio file is needed. */
export const playFeedbackSound = (correct: boolean) => {
  try {
    context ??= new AudioContext()
    const notes = correct ? [660, 880] : [220, 180]
    notes.forEach((frequency, index) => {
      const start = context!.currentTime + index * 0.12
      const oscillator = context!.createOscillator()
      const gain = context!.createGain()
      oscillator.type = correct ? 'sine' : 'triangle'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.08, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18)
      oscillator.connect(gain).connect(context!.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.2)
    })
  } catch {
    // Sound is a nicety: a browser without audio support still shows the result on screen.
  }
}
