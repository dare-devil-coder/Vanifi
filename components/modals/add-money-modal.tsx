'use client'

import React, { useState } from 'react'
import { X, Plus, Landmark, AlertCircle, Check } from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'

interface AddMoneyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddMoneyModal({ isOpen, onClose }: AddMoneyModalProps) {
  const { addMoney } = useFinancial()
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('HDFC Salary Account')
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFloat(amount.replace(/,/g, ''))
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount to deposit')
      return
    }

    setIsProcessing(true)
    setTimeout(() => {
      addMoney(num, source)
      setIsProcessing(false)
      setAmount('')
      setError('')
      onClose()
    }, 400)
  }

  const setPreset = (val: number) => {
    setAmount(val.toString())
    setError('')
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card small-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="soft-label">CASHFLOW INFLOW</span>
            <h2>Add money to account</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <p className="modal-sub">
          Adding funds increases your liquid balance and instantly raises your <strong>Safe-to-Spend limit</strong>.
        </p>

        {error && (
          <div className="modal-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdd} className="modal-form">
          <div className="form-group">
            <label htmlFor="add-amount">Amount to add (₹)</label>
            <input
              id="add-amount"
              type="number"
              placeholder="e.g. 10,000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="100"
              required
            />
          </div>

          <div className="quick-earmark-buttons">
            <button type="button" className="chip-btn" onClick={() => setPreset(5000)}>
              +₹5,000
            </button>
            <button type="button" className="chip-btn" onClick={() => setPreset(10000)}>
              +₹10,000
            </button>
            <button type="button" className="chip-btn" onClick={() => setPreset(25000)}>
              +₹25,000
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="add-source">Fund source</label>
            <select
              id="add-source"
              value={source}
              onChange={e => setSource(e.target.value)}
            >
              <option value="HDFC Salary Account (••• 4821)">HDFC Salary Account (••• 4821)</option>
              <option value="UPI Linked Account">UPI Linked Bank Account</option>
              <option value="External Net Banking">External Net Banking</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={onClose} disabled={isProcessing}>
              Cancel
            </button>
            <button type="submit" className="button teal-button" disabled={isProcessing}>
              {isProcessing ? 'Processing credit...' : 'Confirm Deposit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
