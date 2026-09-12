'use client'

import React, { useState } from 'react'
import { X, Calendar, ShieldCheck, PiggyBank, Edit3, Trash2, ArrowRight } from 'lucide-react'
import { useFinancial, Commitment } from '@/lib/financial-context'

interface CommitmentDetailsModalProps {
  commitment: Commitment | null
  isOpen: boolean
  onClose: () => void
  onEdit: (c: Commitment) => void
  onDelete: (c: Commitment) => void
}

export function CommitmentDetailsModal({
  commitment,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: CommitmentDetailsModalProps) {
  const { setAsideForCommitment, safeToSpend } = useFinancial()
  const [allocateAmount, setAllocateAmount] = useState('')
  const [customOpen, setCustomOpen] = useState(false)

  if (!isOpen || !commitment) return null

  const remaining = Math.max(0, commitment.amount - commitment.savedAmount)
  const percentSaved = Math.min(100, Math.round((commitment.savedAmount / commitment.amount) * 100))

  const handleSetAside = (amount: number) => {
    if (amount <= 0) return
    setAsideForCommitment(commitment.id, amount)
    setAllocateAmount('')
    setCustomOpen(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="tag">{commitment.priority.toUpperCase()}</span>
            <h2>{commitment.title}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="details-stat-banner">
          <div>
            <span className="muted-label">TOTAL COMMITMENT</span>
            <strong>₹{commitment.amount.toLocaleString('en-IN')}</strong>
          </div>
          <div className="stat-right">
            <span className="muted-label">DUE BY</span>
            <b>{commitment.dueDate}</b>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-info">
            <span>Earmarked: ₹{commitment.savedAmount.toLocaleString('en-IN')}</span>
            <span>{percentSaved}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percentSaved}%` }} />
          </div>
          <p className="progress-sub">
            {remaining > 0
              ? `₹${remaining.toLocaleString('en-IN')} still unreserved before due date.`
              : 'Fully reserved! Your safe-to-spend balance is insulated.'}
          </p>
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <span>Category</span>
            <strong>{commitment.category}</strong>
          </div>
          <div className="detail-item">
            <span>Status</span>
            <strong className="positive">Virtual Reserve Active</strong>
          </div>
          {commitment.notes && (
            <div className="detail-item full-width">
              <span>Notes</span>
              <p>{commitment.notes}</p>
            </div>
          )}
        </div>

        {remaining > 0 && (
          <div className="earmark-box">
            <div className="earmark-head">
              <PiggyBank size={18} />
              <div>
                <strong>Set aside funds virtually</strong>
                <small>Protects this amount from accidental spending</small>
              </div>
            </div>

            <div className="quick-earmark-buttons">
              <button
                className="chip-btn"
                onClick={() => handleSetAside(Math.min(5000, remaining))}
              >
                +₹5,000
              </button>
              <button
                className="chip-btn"
                onClick={() => handleSetAside(Math.min(10000, remaining))}
              >
                +₹10,000
              </button>
              <button
                className="chip-btn highlight"
                onClick={() => handleSetAside(remaining)}
              >
                Fund Full (₹{remaining.toLocaleString('en-IN')})
              </button>
            </div>
          </div>
        )}

        <div className="virtual-badge">
          <ShieldCheck size={18} />
          <span>
            <strong>Virtual Protection:</strong> Vani-Fi tracks your future expenses to protect your Safe-to-Spend limit without locking your bank funds.
          </span>
        </div>

        <div className="modal-actions-split">
          <div className="modal-actions-left">
            <button
              type="button"
              className="ghost-button danger-text"
              onClick={() => {
                onClose()
                onDelete(commitment)
              }}
            >
              <Trash2 size={16} /> Delete
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                onClose()
                onEdit(commitment)
              }}
            >
              <Edit3 size={16} /> Edit
            </button>
          </div>
          <button type="button" className="button teal-button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
