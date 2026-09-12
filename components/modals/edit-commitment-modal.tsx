'use client'

import React, { useState, useEffect } from 'react'
import { X, AlertCircle, ShieldCheck } from 'lucide-react'
import { useFinancial, Commitment } from '@/lib/financial-context'

interface EditCommitmentModalProps {
  commitment: Commitment | null
  isOpen: boolean
  onClose: () => void
}

export function EditCommitmentModal({ commitment, isOpen, onClose }: EditCommitmentModalProps) {
  const { updateCommitment } = useFinancial()

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState<'Education' | 'Housing' | 'Insurance' | 'Bills' | 'Family'>('Education')
  const [priority, setPriority] = useState<'High priority' | 'Recurring' | 'Protected'>('High priority')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (commitment) {
      setTitle(commitment.title)
      setAmount(commitment.amount.toString())
      setDueDate(commitment.dueDate)
      setCategory(commitment.category)
      setPriority(commitment.priority)
      setNotes(commitment.notes || '')
      setError('')
    }
  }, [commitment])

  if (!isOpen || !commitment) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(amount.replace(/,/g, ''))

    if (!title.trim()) {
      setError('Please enter a description for the commitment')
      return
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (!dueDate.trim()) {
      setError('Please enter when this expense is expected')
      return
    }

    updateCommitment(commitment.id, {
      title: title.trim(),
      amount: numAmount,
      dueDate: dueDate.trim(),
      category,
      priority,
      notes: notes.trim() || undefined,
    })

    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="soft-label">MODIFY GOAL</span>
            <h2>Edit commitment</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="modal-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="edit-title">Expense description</label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-amount">Amount (₹)</label>
              <input
                id="edit-amount"
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="100"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-date">Expected date</label>
              <input
                id="edit-date"
                type="text"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-cat">Category</label>
              <select
                id="edit-cat"
                value={category}
                onChange={e => setCategory(e.target.value as any)}
              >
                <option value="Education">Education</option>
                <option value="Housing">Housing & Rent</option>
                <option value="Insurance">Insurance</option>
                <option value="Bills">Bills & Utilities</option>
                <option value="Family">Family Support</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-prio">Priority</label>
              <select
                id="edit-prio"
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
              >
                <option value="High priority">High priority</option>
                <option value="Recurring">Recurring regular</option>
                <option value="Protected">Protected reserve</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-notes">Notes</label>
            <input
              id="edit-notes"
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="virtual-badge">
            <ShieldCheck size={18} />
            <span>
              Updating this value immediately recalculates your <strong>Safe-to-Spend balance</strong>.
            </span>
          </div>

          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button teal-button">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
