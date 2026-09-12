'use client'

import React, { useState } from 'react'
import { X, Send, AlertCircle } from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'

interface TransferMoneyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TransferMoneyModal({ isOpen, onClose }: TransferMoneyModalProps) {
  const { transferMoney, currentBalance, safeToSpend } = useFinancial()
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFloat(amount.replace(/,/g, ''))
    if (!recipient.trim()) {
      setError('Please enter a recipient name or UPI ID')
      return
    }
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (num > currentBalance) {
      setError(`Amount exceeds your liquid balance of ₹${currentBalance.toLocaleString('en-IN')}`)
      return
    }

    setIsProcessing(true)
    setTimeout(() => {
      const ok = transferMoney(num, recipient.trim(), note.trim() || 'UPI Transfer')
      setIsProcessing(false)
      if (ok) {
        setAmount('')
        setRecipient('')
        setNote('')
        setError('')
        onClose()
      }
    }, 450)
  }

  const numAmount = parseFloat(amount.replace(/,/g, '')) || 0
  const exceedsSafeToSpend = numAmount > safeToSpend

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card small-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="soft-label">CASH OUTFLOW</span>
            <h2>Send or Transfer Money</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="transfer-balance-pill">
          <span>Safe-to-Spend limit: <strong>₹{safeToSpend.toLocaleString('en-IN')}</strong></span>
        </div>

        {exceedsSafeToSpend && (
          <div className="warning-banner">
            <AlertCircle size={16} />
            <span>
              <strong>Careful:</strong> Transferring more than ₹{safeToSpend.toLocaleString('en-IN')} touches funds reserved for upcoming commitments!
            </span>
          </div>
        )}

        {error && (
          <div className="modal-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleTransfer} className="modal-form">
          <div className="form-group">
            <label htmlFor="trans-recipient">Recipient (UPI ID or Name)</label>
            <input
              id="trans-recipient"
              type="text"
              placeholder="e.g. rahul@oksbi or Priya"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="trans-amount">Amount (₹)</label>
            <input
              id="trans-amount"
              type="number"
              placeholder="e.g. 2,500"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="trans-note">Note / Purpose (Optional)</label>
            <input
              id="trans-note"
              type="text"
              placeholder="e.g. Groceries, Dinner share"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={onClose} disabled={isProcessing}>
              Cancel
            </button>
            <button type="submit" className="button teal-button" disabled={isProcessing}>
              {isProcessing ? 'Transferring...' : 'Confirm Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
