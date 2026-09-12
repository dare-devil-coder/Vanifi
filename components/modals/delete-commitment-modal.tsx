'use client'

import React from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { useFinancial, Commitment } from '@/lib/financial-context'

interface DeleteCommitmentModalProps {
  commitment: Commitment | null
  isOpen: boolean
  onClose: () => void
}

export function DeleteCommitmentModal({ commitment, isOpen, onClose }: DeleteCommitmentModalProps) {
  const { deleteCommitment } = useFinancial()

  if (!isOpen || !commitment) return null

  const handleDelete = () => {
    deleteCommitment(commitment.id)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card small-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="danger-tag-wrap">
            <div className="danger-icon-circle">
              <AlertTriangle size={20} />
            </div>
            <div>
              <span className="soft-label">CONFIRM REMOVAL</span>
              <h2>Remove commitment?</h2>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <p className="modal-sub">
          Are you sure you want to remove <strong>{commitment.title}</strong> (₹{commitment.amount.toLocaleString('en-IN')})?
        </p>
        <p className="modal-note-small">
          Removing this will restore ₹{commitment.amount.toLocaleString('en-IN')} back into your <strong>Safe-to-Spend balance</strong>.
        </p>

        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Keep commitment
          </button>
          <button type="button" className="button danger-button" onClick={handleDelete}>
            Yes, remove
          </button>
        </div>
      </div>
    </div>
  )
}
