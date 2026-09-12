'use client'

import React, { useState } from 'react'
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'

interface ReportIssueModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ReportIssueModal({ isOpen, onClose }: ReportIssueModalProps) {
  const { addNotification, showToast } = useFinancial()
  const [category, setCategory] = useState('Suspicious Activity')
  const [details, setDetails] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!details.trim()) return

    const ticketId = `SEC-${Math.floor(100000 + Math.random() * 900000)}`
    addNotification(
      `Support Case Opened #${ticketId}`,
      `Our Fraud & Security desk is reviewing: "${category}". We will reach out within 15 minutes.`,
      'security',
      '/app/protection'
    )
    showToast(`Support Case #${ticketId} submitted`)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setDetails('')
      onClose()
    }, 1500)
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card small-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="soft-label">SECURITY DESK</span>
            <h2>Report an Issue or Fraud</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="success-dialog-body">
            <CheckCircle2 size={48} className="positive" />
            <h3>Report Received</h3>
            <p>Our 24/7 security guardian desk has received your ticket and will verify your transaction safeguards.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="issue-category">Issue type</label>
              <select
                id="issue-category"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Suspicious Activity">Suspicious Activity / Unknown Merchant</option>
                <option value="Unauthorized Debit">Unauthorized Debit or UPI Push</option>
                <option value="Card Lost or Stolen">Freeze Virtual Card Immediately</option>
                <option value="Incorrect Balance">Balance Discrepancy</option>
                <option value="Other">General Security Inquiry</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="issue-desc">Provide details</label>
              <textarea
                id="issue-desc"
                rows={3}
                placeholder="Describe what happened or which transaction you are disputing..."
                value={details}
                onChange={e => setDetails(e.target.value)}
                required
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="button danger-button">
                Submit Security Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
