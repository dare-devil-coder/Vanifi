'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Mic, ArrowRight, LockKeyhole, Sparkles, Check, AlertCircle, RefreshCw, Volume2, Square } from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'
import type { Commitment } from '@/lib/financial-context'
import { parseVoiceIntent } from '@/lib/financial/calculations'

interface ChatMessage {
  id: string
  sender: 'vani' | 'you'
  text: string
  intentAction?: {
    category: string
    amount: number
    dueDate: string
    confirmed?: boolean
  }
}

export default function AssistantPage() {
  const {
    safeToSpend,
    currentBalance,
    addCommitment,
    language,
    voiceState,
    voicePayload,
    simulateVoiceInput,
    showToast,
  } = useFinancial()

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'vani',
      text: 'Namaste Riya. I am Vani, your financial copilot. I understand Hindi, English, and Gujarati. Tell me what is on your mind or what expenses are coming up.',
    },
  ])

  const [isAiLoading, setIsAiLoading] = useState(false)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)

  const playSarvamAudio = async (msgId: string, text: string) => {
    try {
      setPlayingAudioId(msgId)
      const targetLang = language === 'ગુજરાતી' ? 'gu-IN' : 'hi-IN'
      const res = await fetch('/api/sarvam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'tts',
          text,
          targetLang,
        }),
      })
      if (!res.ok) throw new Error('TTS request failed')
      const data = await res.json()
      if (data.audios && data.audios[0]) {
        const audio = new Audio(`data:audio/wav;base64,${data.audios[0]}`)
        audio.onended = () => setPlayingAudioId(null)
        audio.onerror = () => setPlayingAudioId(null)
        await audio.play()
      } else {
        setPlayingAudioId(null)
      }
    } catch (e) {
      console.warn('Sarvam audio playback failed:', e)
      setPlayingAudioId(null)
      showToast('Audio playback could not be loaded.')
    }
  }

  const handleSend = async (text: string) => {
    const clean = text.trim()
    if (!clean) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'you',
      text: clean,
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsAiLoading(true)

    try {
      // Send to Gemini & Sarvam API endpoint with entire conversation history
      const historyPayload = messages.map(m => ({
        sender: m.sender,
        text: m.text,
      }))

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: clean,
          history: historyPayload,
          language: language,
          financialContext: {
            currentBalance,
            safeToSpend,
          },
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const replyMessage = data.vernacularReply || data.replyText || 'मैंने आपकी बात समझ ली है।'
        const vaniResponse: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'vani',
          text: replyMessage,
          intentAction: data.intentAction?.amount
            ? {
                category: data.intentAction.category || 'Family',
                amount: Number(data.intentAction.amount),
                dueDate: data.intentAction.dueDate || 'Next month',
                confirmed: false,
              }
            : undefined,
        }
        setMessages(prev => [...prev, vaniResponse])
        setIsAiLoading(false)
        return
      }
    } catch (err) {
      console.warn('Gemini/Sarvam route failed or offline, falling back to local engine:', err)
    }

    // Fallback: Deterministic financial rules engine
    setTimeout(() => {
      setIsAiLoading(false)
      if (clean.toLowerCase().includes('fee') || clean.includes('फीस') || clean.includes('college')) {
        const parsed = parseVoiceIntent(clean)
        const vaniResponse: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'vani',
          text: parsed.spokenConfirmation,
          intentAction: parsed.amount && parsed.dueDate
            ? {
                category: parsed.category,
                amount: parsed.amount,
                dueDate: parsed.dueDate,
                confirmed: false,
              }
            : undefined,
        }
        setMessages(prev => [...prev, vaniResponse])
      } else if (clean.toLowerCase().includes('loan') || clean.includes('लोन') || clean.includes('कर्ज')) {
        const vaniResponse: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'vani',
          text: `आपके वर्तमान कमिटमेंट्स और लिक्विडिटी को देखते हुए, ₹50,000 का लोन लेने से आपके मासिक खर्च पर ₹4,689/माह का अतिरिक्त दबाव पड़ेगा। आपकी सुरक्षित खर्च सीमा अभी ₹${safeToSpend.toLocaleString('en-IN')} है। यदि संभव हो, तो बिना लोन लिए पहले अपने बफर का उपयोग करना ज्यादा सुरक्षित रहेगा।`,
        }
        setMessages(prev => [...prev, vaniResponse])
      } else if (clean.toLowerCase().includes('safe') || clean.includes('spend') || clean.includes('खर्च')) {
        const vaniResponse: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'vani',
          text: `आपकी वर्तमान सुरक्षित खर्च सीमा ₹${safeToSpend.toLocaleString('en-IN')} है (कुल बैंक बैलेंस: ₹${currentBalance.toLocaleString('en-IN')} में से आगामी कमिटमेंट्स और ₹10,000 का सेफ्टी बफर निकालने के बाद)।`,
        }
        setMessages(prev => [...prev, vaniResponse])
      } else {
        const vaniResponse: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'vani',
          text: 'मैंने आपका संदेश नोट कर लिया है। आपकी वित्तीय स्थिति स्थिर है और आपका डेटा पूरी तरह एन्क्रिप्टेड है। क्या आप कोई आगामी खर्च रिकॉर्ड करना चाहते हैं?',
        }
        setMessages(prev => [...prev, vaniResponse])
      }
    }, 600)
  }

  const handleConfirmIntent = (msgId: string, action: NonNullable<ChatMessage['intentAction']>) => {
    const category: Commitment['category'] = ['Education', 'Housing', 'Insurance', 'Bills', 'Family'].includes(action.category)
      ? action.category as Commitment['category']
      : 'Family'
    addCommitment({
      title: `${action.category} (Added via Vani Voice)`,
      amount: action.amount,
      dueDate: action.dueDate,
      category,
      priority: 'High priority',
      notes: 'Recorded via Vernacular AI Assistant',
    })

    setMessages(prev =>
      prev.map(m => {
        if (m.id === msgId && m.intentAction) {
          return {
            ...m,
            intentAction: { ...m.intentAction, confirmed: true },
          }
        }
        return m
      })
    )

    const ackMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'vani',
      text: `धन्यवाद! ₹${action.amount.toLocaleString('en-IN')} की जिम्मेदारी दर्ज कर ली गई है। आपका Safe-to-Spend बैलेंस अपडेट हो गया है।`,
    }
    setMessages(prev => [...prev, ackMsg])
  }

  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<any>(null)
  const transcriptRef = useRef<string>('')
  const persistedTranscriptRef = useRef<string>('')
  const isManuallyRecordingRef = useRef<boolean>(false)

  // Clean up speech recognition on component unmount
  useEffect(() => {
    return () => {
      isManuallyRecordingRef.current = false
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {}
      }
    }
  }, [])

  const stopRecordingAndSend = (forcedText?: string) => {
    isManuallyRecordingRef.current = false
    setIsRecording(false)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // ignore stop errors
      }
    }
    const textToSend = (forcedText !== undefined ? forcedText : (transcriptRef.current || input)).trim()
    if (textToSend) {
      handleSend(textToSend)
    } else {
      showToast('No speech detected. Please click the mic and try speaking again.')
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      // User clicked mic to STOP recording and interpret
      stopRecordingAndSend()
      return
    }

    // User clicked mic to START recording
    transcriptRef.current = ''
    persistedTranscriptRef.current = ''
    setInput('')

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      try {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        const rec = new SpeechRec()
        recognitionRef.current = rec
        rec.continuous = true // Don't stop when user pauses or takes a break
        rec.interimResults = true // Real-time feedback
        rec.lang = language === 'ગુજરાતી' ? 'gu-IN' : language === 'हिन्दी' ? 'hi-IN' : 'en-IN'
        isManuallyRecordingRef.current = true

        rec.onstart = () => {
          setIsRecording(true)
          showToast('Mic on. Speak freely — take breaks if needed. Click the mic again when you want to send!')
        }

        rec.onresult = (e: any) => {
          let sessionText = ''
          for (let i = 0; i < e.results.length; i++) {
            const fragment = e.results[i]?.[0]?.transcript || ''
            sessionText += fragment + ' '
          }
          const combined = (persistedTranscriptRef.current ? persistedTranscriptRef.current + ' ' : '') + sessionText
          const cleanCombined = combined.replace(/\s+/g, ' ').trim()
          transcriptRef.current = cleanCombined
          setInput(cleanCombined)
        }

        rec.onerror = (e: any) => {
          console.warn('Mic speech error:', e.error)
          if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
            isManuallyRecordingRef.current = false
            setIsRecording(false)
            showToast('Microphone access blocked. Please allow browser mic permission.')
          } else if (e.error === 'no-speech') {
            // User paused or stayed silent for a while: keep mic open for user
            console.log('Silence detected during recording, keeping mic active...')
          }
        }

        rec.onend = () => {
          // If browser timed out during a pause but user hasn't clicked stop, restart smoothly
          if (isManuallyRecordingRef.current) {
            persistedTranscriptRef.current = transcriptRef.current
            try {
              rec.start()
            } catch (err) {
              console.warn('Could not auto-restart recognition:', err)
              setIsRecording(false)
              isManuallyRecordingRef.current = false
            }
          } else {
            setIsRecording(false)
          }
        }

        rec.start()
      } catch (err) {
        console.warn('SpeechRecognition failed:', err)
        setIsRecording(false)
        isManuallyRecordingRef.current = false
        showToast('Could not access microphone.')
      }
    } else {
      showToast('Speech recognition not supported in this browser.')
    }
  }

  return (
    <section className="assistant">
      <div className="assistant-header">
        <div
          className={`assistant-orb ${isRecording ? 'listening pulse' : ''}`}
          onClick={toggleRecording}
          style={{ cursor: 'pointer' }}
          title={isRecording ? 'Recording in progress: Click to Stop and Send' : 'Click to start microphone'}
        >
          {isRecording ? <Square size={20} fill="#ef4444" color="#ef4444" /> : <Mic size={26} />}
        </div>
        <div>
          <span className="soft-label">VERNACULAR COPILOT</span>
          <h2>Talk it through with Vani.</h2>
          <p>
            {isRecording
              ? '🎙️ Microphone listening... Take your time. Click mic again when finished.'
              : 'Ask in Hindi, English, or Gujarati. Vani explains before it acts.'}
          </p>
        </div>
      </div>

      <div className="chat-window">
        {messages.map(m => (
          <div key={m.id} className={`chat-bubble-wrap ${m.sender}`}>
            <div className={`chat-bubble ${m.sender}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div>{m.text}</div>
                {m.sender === 'vani' && (
                  <button
                    onClick={() => playSarvamAudio(m.id, m.text)}
                    disabled={playingAudioId === m.id}
                    title="Listen with Sarvam Vernacular Voice"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      color: playingAudioId === m.id ? '#0d9488' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {playingAudioId === m.id ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <Volume2 size={15} />
                    )}
                  </button>
                )}
              </div>

              {/* Explicit Confirmation Action Card */}
              {m.intentAction && (
                <div className="chat-intent-card">
                  <span className="tag">CONFIRM INTENT</span>
                  <div className="intent-line">
                    <span>Expense: <strong>{m.intentAction.category}</strong></span>
                    <span>Amount: <strong>₹{m.intentAction.amount.toLocaleString('en-IN')}</strong></span>
                    <span>Date: <strong>{m.intentAction.dueDate}</strong></span>
                  </div>

                  {m.intentAction.confirmed ? (
                    <div className="confirmed-pill positive">
                      <Check size={14} /> Confirmed & Protected in Safe-to-Spend
                    </div>
                  ) : (
                    <button
                      className="button teal-button mini-btn"
                      onClick={() => handleConfirmIntent(m.id, m.intentAction!)}
                    >
                      <Check size={14} /> Confirm & Reserve ₹{m.intentAction.amount.toLocaleString('en-IN')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Thinking / Generating indicator */}
        {isAiLoading && (
          <div className="chat-bubble-wrap vani">
            <div className="chat-bubble vani" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} className="animate-spin" />
              <span>Vani is thinking...</span>
            </div>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="suggestions">
          <button onClick={() => handleSend('Can I afford a ₹50,000 loan right now?')}>
            Can I afford a loan?
          </button>
          <button onClick={() => handleSend('How much can I safely spend today?')}>
            What can I spend?
          </button>
          <button onClick={() => handleSend('मेरी बेटी की कॉलेज फीस ₹50,000 जोड़ें')}>
            कॉलेज फीस जोड़ें (₹50,000)
          </button>
        </div>
      </div>

      <form
        onSubmit={e => {
          e.preventDefault()
          if (isRecording) {
            stopRecordingAndSend(input)
          } else {
            handleSend(input)
          }
        }}
        className="chat-input"
      >
        <button
          type="button"
          onClick={toggleRecording}
          className={isRecording ? 'recording-mic-pulse' : ''}
          style={
            isRecording
              ? {
                  color: '#ffffff',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
                }
              : {}
          }
          title={isRecording ? 'Recording active: Click to Stop and Send' : 'Click to speak via Microphone'}
          aria-label={isRecording ? 'Stop recording and send message' : 'Microphone voice input'}
        >
          {isRecording ? <Square size={16} fill="#ffffff" /> : <Mic size={19} />}
        </button>

        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={
            isRecording
              ? 'Listening... speak freely, take breaks, then click stop button to send'
              : "Tell Vani what is on your mind (e.g. 'Can I afford a loan?' or 'Fees due next month')..."
          }
        />

        <button type="submit" className="send-button" aria-label="Send message">
          <ArrowRight size={18} />
        </button>
      </form>

      <p className="assistant-note">
        <LockKeyhole size={13} /> Vani explains before it recommends. You are always in control.
      </p>
    </section>
  )
}
