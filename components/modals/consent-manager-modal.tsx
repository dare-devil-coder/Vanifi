'use client'

import React, { useState } from 'react'
import { X, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'

interface ConsentManagerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ConsentManagerModal({ isOpen, onClose }: ConsentManagerModalProps) {
  const { showToast } = useFinancial()
  const [hdfcConsent, setHdfcConsent] = useState(true)
  const [cardConsent, setCardConsent] = useState(true)
  const [voiceConsent, setVoiceConsent] = useState(true)

  if (!isOpen) return null

  const handleSave = () => {
    showToast('Consent preferences updated and synchronized with Account Aggregator')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="soft-label">ACCOUNT AGGREGATOR CONSENT</span>
            <h2>Manage Data Permissions</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <p className="modal-sub">
          You are always in control of your financial data. Vani-Fi accesses data only via RBI-regulated Account Aggregators. Permissions can be revoked anytime.
        </p>

        <div className="consent-list">
          <div className="consent-row">
            <div>
              <strong>HDFC Bank Salary Account (••• 4821)</strong>
              <p>Read-only access to transaction history and daily balance for Safe-to-Spend calculations.</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={hdfcConsent}
                onChange={e => setHdfcConsent(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="consent-row">
            <div>
              <strong>Vani Virtual Card Aggregation</strong>
              <p>Monitors card spends against your virtual upcoming commitment limits.</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={cardConsent}
                onChange={e => setCardConsent(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="consent-row">
            <div>
              <strong>Vernacular Voice Processing</strong>
              <p>Transcribes spoken Hindi, English, or Gujarati to extract upcoming financial commitments. Audio is never stored.</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={voiceConsent}
                onChange={e => setVoiceConsent(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        <div className="virtual-badge">
          <Lock size={16} />
          <span>
            <strong>Zero-Execution Principle:</strong> Vani-Fi cannot withdraw or transfer your money without explicit OTP or biometric confirmation from you.
          </span>
        </div>

        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
          <button type="button" className="button teal-button" onClick={handleSave}>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}
