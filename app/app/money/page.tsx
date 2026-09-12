'use client'

import React, { useState } from 'react'
import { Plus, Send, Landmark, CreditCard, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'
import { AddMoneyModal } from '@/components/modals/add-money-modal'
import { TransferMoneyModal } from '@/components/modals/transfer-money-modal'

export default function MoneyPage() {
  const { currentBalance, safeToSpend, transactions } = useFinancial()
  const [filter, setFilter] = useState<'All' | 'Income' | 'Spends'>('All')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)

  const filteredTransactions = transactions.filter(t => {
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

        <div className="transaction-list">
          {filteredTransactions.length === 0 ? (
            <p className="empty-state-text">No transactions found for this filter.</p>
          ) : (
            filteredTransactions.map(t => (
              <div className="transaction" key={t.id}>
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
              </div>
            ))
          )}
        </div>
      </section>

      {/* Real Interactive Modals */}
      <AddMoneyModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <TransferMoneyModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />
    </>
  )
}
