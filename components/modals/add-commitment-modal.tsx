'use client'

import React, { useState } from 'react'
import { X, Calendar, AlertCircle, ShieldCheck } from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'

interface AddCommitmentModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddCommitmentModal({ isOpen, onClose }: AddCommitmentModalProps) {
  const { addCommitment } = useFinancial()

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState<'Education' | 'Housing' | 'Insurance' | 'Bills' | 'Family'>('Education')
  const [priority, setPriority] = useState<'High priority' | 'Recurring' | 'Protected'>('High priority')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(amount.replace(/,/g, ''))

    if (!title.trim()) {
      setError('Please enter a description for the commitment')
      return
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount')
      return
    }
    if (!dueDate.trim()) {
      setError('Please enter when this expense is expected (e.g. 15 Oct)')
      return
    }

    addCommitment({
      title: title.trim(),
      amount: numAmount,
      dueDate: dueDate.trim(),
      category,
      priority,
      notes: notes.trim() || undefined,
    })

    // Reset and close
    setTitle('')
    setAmount('')
    setDueDate('')
    setNotes('')
    setError('')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="add-comm-title">
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="soft-label">PLAN AHEAD</span>
            <h2 id="add-comm-title">Add upcoming commitment</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <p className="modal-sub">
          When you tell Vani what expenses are coming up, it reserves funds virtually to protect your safe-to-spend limit.
        </p>

        {error && (
          <div className="modal-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="comm-title">Expense description</label>
            <input
              id="comm-title"
              type="text"
              placeholder="e.g. College semester fees, Rent, Car EMI"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="comm-amount">Amount (₹)</label>
              <input
                id="comm-amount"
                type="number"
                placeholder="50,000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="100"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="comm-date">Expected date</label>
              <input
                id="comm-date"
                type="text"
                placeholder="e.g. 18 Oct 2026"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="comm-cat">Category</label>
              <select
                id="comm-cat"
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
              <label htmlFor="comm-prio">Priority</label>
              <select
                id="comm-prio"
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
            <label htmlFor="comm-notes">Notes (Optional)</label>
            <input
              id="comm-notes"
              type="text"
              placeholder="Any specific context or reminder"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="virtual-badge">
            <ShieldCheck size={18} />
            <span>
              <strong>Your commitments are virtual.</strong> Vani-Fi never moves or withdraws this money automatically.
            </span>
          </div>

          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button teal-button">
              Save commitment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
