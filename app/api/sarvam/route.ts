import { NextResponse } from 'next/server'
import { translateWithSarvam, textToSpeechSarvam } from '@/lib/sarvam'

export async function POST(request: Request) {
  try {
    const { action, text, targetLang = 'hi-IN', sourceLang = 'en-IN' } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    if (action === 'tts') {
      const result = await textToSpeechSarvam(text, targetLang)
      return NextResponse.json({
        ...result,
        audios: result.audios || [],
      })
    }

    const result = await translateWithSarvam({
      input: text,
      source_language_code: sourceLang,
      target_language_code: targetLang,
      mode: 'formal',
      speaker_gender: 'Female',
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Sarvam API Route Error:', error)
    return NextResponse.json({
      translated_text: String((await request.clone().json().catch(() => ({ text: '' }))).text || '').trim() || 'Unable to translate at the moment.',
      source_language_code: 'en-IN',
      request_id: 'fallback',
      audios: [],
    }, { status: 200 })
  }
}
