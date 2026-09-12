'use client'

import React, { useState } from 'react'
import { Mic, X, Check, ArrowRight, Sparkles, AlertCircle, RefreshCw, Volume2 } from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'

export function VoiceAssistantDock() {
  const {
    voiceState,
    voicePayload,
    startVoiceListening,
    simulateVoiceInput,
    confirmVoiceAction,
    cancelVoiceAction,
    setVoiceState,
    safeToSpend,
  } = useFinancial()

  const [isOpen, setIsOpen] = useState(false)
  const [customInput, setCustomInput] = useState('')

  const handleOpen = () => {
    setIsOpen(true)
    startVoiceListening()
  }

  const handleClose = () => {
    setIsOpen(false)
    cancelVoiceAction()
    setCustomInput('')
  }

  const handleSimulate = (prompt: string) => {
    simulateVoiceInput(prompt)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customInput.trim()) return
    simulateVoiceInput(customInput.trim())
    setCustomInput('')
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        className="floating-voice"
        onClick={handleOpen}
        aria-label="Talk with Vani AI Assistant"
      >
        <div className="voice-mic-icon">
          <Mic size={20} />
        </div>
        <span>Ask Vani</span>
      </button>

      {/* Interactive Voice Modal / Dock */}
      {isOpen && (
        <div className="voice-dock-overlay" onClick={handleClose} role="dialog" aria-modal="true">
          <div className="voice-dock-card" onClick={e => e.stopPropagation()}>
            <div className="voice-dock-header">
              <div className="voice-dock-title">
                <span className="soft-label">VERNACULAR COPILOT</span>
                <h3>Vani Voice Intelligence</h3>
              </div>
              <button className="modal-close" onClick={handleClose} aria-label="Close assistant">
                <X size={18} />
              </button>
            </div>

            {/* Signature Animated Voice Orb */}
            <div className="voice-orb-container">
              <div className={`voice-orb-avatar ${voiceState.toLowerCase()}`}>
                {voiceState === 'PROCESSING' || voiceState === 'ACTION' ? (
                  <RefreshCw className="animate-spin" size={32} />
                ) : voiceState === 'COMPLETE' ? (
                  <Check size={36} />
                ) : voiceState === 'ERROR' ? (
                  <AlertCircle size={32} />
                ) : (
                  <Mic size={34} />
                )}
              </div>

              <div className="voice-status-pill">
                <span className={`status-indicator ${voiceState.toLowerCase()}`} />
                <span>
                  {voiceState === 'IDLE' && 'Ready to listen'}
                  {voiceState === 'LISTENING' && 'Listening to your voice...'}
                  {voiceState === 'PROCESSING' && 'Transcribing vernacular audio...'}
                  {voiceState === 'UNDERSTANDING' && 'Extracting financial signals...'}
                  {voiceState === 'CONFIRMATION_REQUIRED' && 'Confirmation needed'}
                  {voiceState === 'ACTION' && 'Reserving virtual commitment...'}
                  {voiceState === 'COMPLETE' && 'Finished successfully'}
                  {voiceState === 'ERROR' && 'Unable to process audio'}
                </span>
              </div>
            </div>

            {/* Dynamic Content based on State */}
            <div className="voice-dialog-content">
              {voiceState === 'LISTENING' && (
                <div className="voice-listening-view">
                  <p className="voice-prompt-instruction">
                    Speak naturally in <strong>Hindi, English, or Gujarati</strong>. Or tap an example below:
                  </p>

                  <div className="voice-quick-chips">
                    <button
                      className="voice-chip"
                      onClick={() =>
                        handleSimulate('मेरी बेटी की कॉलेज फीस अगले महीने पचास हजार है')
                      }
                    >
                      <Volume2 size={13} /> “मेरी बेटी की कॉलेज फीस ₹50,000 है”
                    </button>
                    <button
                      className="voice-chip"
                      onClick={() =>
                        handleSimulate('Save my apartment rent of 18000 for next month')
                      }
                    >
                      <Volume2 size={13} /> “Save my rent of ₹18,000”
                    </button>
                    <button
                      className="voice-chip"
                      onClick={() => handleSimulate('How much can I safely spend this month?')}
                    >
                      <Volume2 size={13} /> “How much can I safely spend?”
                    </button>
                  </div>

                  <form onSubmit={handleManualSubmit} className="voice-text-form">
                    <input
                      type="text"
                      placeholder="Or type a financial question or commitment..."
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                    />
                    <button type="submit" className="button teal-button" aria-label="Send">
                      <ArrowRight size={16} />
                    </button>
                  </form>
                </div>
              )}

              {(voiceState === 'PROCESSING' || voiceState === 'UNDERSTANDING') && (
                <div className="voice-loading-view">
                  <p className="pulse-text">Vani is parsing the intent and verifying your cashflow impact...</p>
                  <div className="audio-wave-bars">
                    <span className="wave-bar" />
                    <span className="wave-bar" />
                    <span className="wave-bar" />
                    <span className="wave-bar" />
                    <span className="wave-bar" />
                  </div>
                </div>
              )}

              {voiceState === 'CONFIRMATION_REQUIRED' && voicePayload && (
                <div className="voice-confirmation-view">
                  <div className="detected-intent-box">
                    <span className="tag">FINANCIAL INTENT DETECTED</span>
                    <h4>{voicePayload.spokenConfirmation}</h4>

                    <div className="intent-breakdown">
                      <div>
                        <span>Identified Expense:</span>
                        <strong>{voicePayload.category || 'Commitment'}</strong>
                      </div>
                      <div>
                        <span>Estimated Amount:</span>
                        <strong>₹{voicePayload.amount?.toLocaleString('en-IN')}</strong>
                      </div>
                      <div>
                        <span>Target Date:</span>
                        <strong>{voicePayload.dueDate || 'Next Month'}</strong>
                      </div>
                      <div>
                        <span>Confidence:</span>
                        <strong className="positive">High (96%)</strong>
                      </div>
                    </div>

                    <p className="intent-disclaimer">
                      “Never automatically create a confirmed commitment solely from NLP. Your consent is required.”
                    </p>
                  </div>

                  <div className="confirmation-actions">
                    <button className="ghost-button" onClick={cancelVoiceAction}>
                      Discard / Cancel
                    </button>
                    <button className="button teal-button" onClick={confirmVoiceAction}>
                      <Check size={16} /> Confirm & Reserve
                    </button>
                  </div>
                </div>
              )}

              {voiceState === 'COMPLETE' && (
                <div className="voice-complete-view">
                  <h4>{voicePayload?.spokenConfirmation || 'Action completed!'}</h4>
                  <p>
                    Your <strong>Safe-to-Spend balance</strong> is currently{' '}
                    <strong className="positive">₹{safeToSpend.toLocaleString('en-IN')}</strong>.
                  </p>
                  <button className="button teal-button" onClick={() => startVoiceListening()}>
                    Ask something else
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
