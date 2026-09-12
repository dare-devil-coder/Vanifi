'use client'

import React, { useState } from 'react'
import { Mic, ArrowRight, LockKeyhole, Sparkles, Check, AlertCircle, RefreshCw, Volume2 } from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'

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

  const handleSend = (text: string) => {
    const clean = text.trim()
    if (!clean) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'you',
      text: clean,
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')

    // Process vernacular intent
    setTimeout(() => {
      if (clean.toLowerCase().includes('fee') || clean.includes('फीस') || clean.includes('college')) {
        const vaniResponse: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'vani',
          text: 'मैंने पहचान लिया है कि आपको कॉलेज फीस के लिए ₹50,000 की जरूरत होगी। क्या आप चाहते हैं कि मैं इसे आगामी जिम्मेदारी के रूप में सुरक्षित कर दूं ताकि आपका सेफ-टू-स्पेंड बैलेंस सुरक्षित रहे?',
          intentAction: {
            category: 'Education',
            amount: 50000,
            dueDate: '18 Oct 2026',
            confirmed: false,
          },
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
    addCommitment({
      title: `${action.category} (Added via Vani Voice)`,
      amount: action.amount,
      dueDate: action.dueDate,
      category: action.category as any,
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

  return (
    <section className="assistant">
      <div className="assistant-header">
        <div className="assistant-orb">
          <Mic size={26} />
        </div>
        <div>
          <span className="soft-label">VERNACULAR COPILOT</span>
          <h2>Talk it through with Vani.</h2>
          <p>Ask in Hindi, English, or Gujarati. Vani explains before it acts.</p>
        </div>
      </div>

      <div className="chat-window">
        {messages.map(m => (
          <div key={m.id} className={`chat-bubble-wrap ${m.sender}`}>
            <div className={`chat-bubble ${m.sender}`}>
              {m.text}

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
          handleSend(input)
        }}
        className="chat-input"
      >
        <button
          type="button"
          onClick={() => handleSend('मेरी बेटी की कॉलेज फीस अगले महीने पचास हजार है')}
          title="Simulate vernacular voice input"
          aria-label="Simulate voice prompt"
        >
          <Mic size={19} />
        </button>

        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Tell Vani what is on your mind (e.g. 'Can I afford a loan?' or 'Fees due next month')..."
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
