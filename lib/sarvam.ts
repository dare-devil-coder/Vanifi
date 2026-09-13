// Sarvam AI Client Utility for Indian Languages (Translation, TTS, STT)

export interface SarvamTranslateParams {
  input: string
  source_language_code?: string
  target_language_code: string
  speaker_gender?: 'Male' | 'Female'
  mode?: 'formal' | 'colloquial'
}

export interface SarvamTranslateResult {
  translated_text: string
  source_language_code?: string
  request_id?: string
}

const fallbackSarvamTranslate = (input: string, targetLanguageCode: string): SarvamTranslateResult => ({
  translated_text: input,
  source_language_code: 'en-IN',
  request_id: 'local-fallback',
})

export async function translateWithSarvam(params: SarvamTranslateParams): Promise<SarvamTranslateResult> {
  const apiKey = process.env.SARVAM_API_KEY
  if (!apiKey) {
    return fallbackSarvamTranslate(params.input, params.target_language_code)
  }

  try {
    const response = await fetch('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: params.input,
        source_language_code: params.source_language_code || 'en-IN',
        target_language_code: params.target_language_code,
        speaker_gender: params.speaker_gender || 'Female',
        mode: params.mode || 'formal',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.warn('Sarvam translation unavailable, using local fallback:', errorText)
      return fallbackSarvamTranslate(params.input, params.target_language_code)
    }

    return response.json()
  } catch (error) {
    console.warn('Sarvam translation failed, using local fallback:', error)
    return fallbackSarvamTranslate(params.input, params.target_language_code)
  }
}

/**
 * Text-to-speech using Sarvam AI Bulbul / TTS endpoint
 */
export async function textToSpeechSarvam(text: string, languageCode: string = 'hi-IN'): Promise<{ audios: string[] }> {
  const apiKey = process.env.SARVAM_API_KEY
  if (!apiKey) {
    return { audios: [] }
  }

  try {
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: languageCode,
        speaker: 'kavya',
        pace: 1.0,
        speech_sample_rate: 8000,
        enable_preprocessing: true,
        model: 'bulbul:v3',
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.warn('Sarvam TTS unavailable, using local fallback:', err)
      return { audios: [] }
    }

    return response.json()
  } catch (error) {
    console.warn('Sarvam TTS failed, using local fallback:', error)
    return { audios: [] }
  }
}
