'use client'

import React, { useState } from 'react'
import { Plus, Send, Landmark, CreditCard, TrendingUp, Search, X } from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'
import { AddMoneyModal } from '@/components/modals/add-money-modal'
import { TransferMoneyModal } from '@/components/modals/transfer-money-modal'

export default function MoneyPage() {
  const { currentBalance, safeToSpend, transactions } = useFinancial()
  const [filter, setFilter] = useState<'All' | 'Income' | 'Spends'>('All')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<(typeof transactions)[number] | null>(null)

  const filteredTransactions = transactions.filter(t => {
    if (query && !`${t.title} ${t.category} ${t.date}`.toLowerCase().includes(query.toLowerCase())) return false
    if (filter === 'Income') return t.type === 'income'
    if (filter === 'Spends') return t.type === 'expense'
    return true
  })

  return (
    <>
      {/* Balance Summary Header */}
      <section className="money-summary">
        <div>
          <span className="soft-label">TOTAL LIQUID BALANCE</span>
          <h2>₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          <span className="positive">
            <TrendingUp size={15} /> 8.4% growth this month
          </span>
        </div>

        <div className="money-actions">
          <button
            className="button teal-button"
            onClick={() => setIsAddOpen(true)}
            id="btn-add-money"
          >
            <Plus size={16} /> Add money
          </button>
          <button
            className="ghost-button"
            onClick={() => setIsTransferOpen(true)}
            id="btn-transfer-money"
          >
            <Send size={15} /> Transfer
          </button>
        </div>
      </section>

      {/* Account Cards */}
      <div className="money-cards">
        <div className="account-card">
          <div>
            <Landmark size={20} />
            <span>HDFC Bank ·•• 4821</span>
          </div>
          <strong>₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          <small>Primary Salary Account (Account Aggregator Linked)</small>
        </div>

        <div className="account-card lighter">
          <div>
            <CreditCard size={20} />
            <span>Vani Virtual Card</span>
          </div>
          <strong className="teal">₹{safeToSpend.toLocaleString('en-IN')}</strong>
          <small>Dynamic Safe-to-Spend Limit</small>
        </div>
      </div>

      {/* Transaction History & Filter */}
      <section className="panel transactions">
        <div className="panel-heading">
          <div>
            <span className="soft-label">TRANSACTION AUDIT</span>
            <h3>Money movement</h3>
          </div>

          <div className="filter-row">
            {(['All', 'Income', 'Spends'] as const).map(f => (
              <button
                key={f}
                className={`filter ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="transaction-search">
          <Search size={16} aria-hidden="true" />
          <input
            aria-label="Search transactions"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search transactions"
          />
          {query && <button type="button" aria-label="Clear transaction search" onClick={() => setQuery('')}><X size={15} /></button>}
        </div>

        <div className="transaction-list">
          {filteredTransactions.length === 0 ? (
            <p className="empty-state-text">No transactions found for this filter.</p>
          ) : (
            filteredTransactions.map(t => (
              <button className="transaction transaction-button" key={t.id} type="button" onClick={() => setSelectedTransaction(t)}>
                <div className="transaction-icon">{t.title[0]}</div>
                <div>
                  <b>{t.title}</b>
                  <span>
                    {t.category} · {t.date}
                  </span>
                </div>
                <strong className={t.type === 'income' ? 'positive' : ''}>
                  {t.type === 'income'
                    ? `+₹${t.amount.toLocaleString('en-IN')}`
                    : `-₹${Math.abs(t.amount).toLocaleString('en-IN')}`}
                </strong>
              </button>
            ))
          )}
        </div>
      </section>

      {/* Real Interactive Modals */}
      <AddMoneyModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <TransferMoneyModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />

      {selectedTransaction && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="transaction-detail-title" onClick={() => setSelectedTransaction(null)}>
          <div className="modal-card small-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div><span className="soft-label">TRANSACTION DETAIL</span><h2 id="transaction-detail-title">{selectedTransaction.title}</h2></div>
              <button className="modal-close" aria-label="Close transaction details" onClick={() => setSelectedTransaction(null)}><X size={20} /></button>
            </div>
            <div className="details-grid">
              <div className="detail-item"><span>Amount</span><strong>{selectedTransaction.type === 'income' ? '+' : '-'}₹{Math.abs(selectedTransaction.amount).toLocaleString('en-IN')}</strong></div>
              <div className="detail-item"><span>Category</span><strong>{selectedTransaction.category}</strong></div>
              <div className="detail-item"><span>Date</span><strong>{selectedTransaction.date}</strong></div>
              <div className="detail-item"><span>Status</span><strong className="positive">Completed in demo</strong></div>
            </div>
            <div className="modal-actions"><button className="button teal-button" onClick={() => setSelectedTransaction(null)}>Done</button></div>
          </div>
        </div>
      )}
    </>
  )
}
