'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  PiggyBank,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Plus,
} from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'
import { AddCommitmentModal } from '@/components/modals/add-commitment-modal'

export default function DashboardOverview() {
  const router = useRouter()
  const {
    safeToSpend,
    currentBalance,
    totalUpcomingCommitments,
    pulseScore,
    pulseMomentum,
    commitments,
    transactions,
    stressLevel,
    setAsideForCommitment,
    showToast,
  } = useFinancial()

  const [addModalOpen, setAddModalOpen] = useState(false)

  // College fee commitment for quick action
  const collegeFee = commitments.find(c => c.title.toLowerCase().includes('college')) || commitments[0]
  const remainingForCollege = collegeFee ? Math.max(0, collegeFee.amount - collegeFee.savedAmount) : 0

  const handleQuickSetAside = () => {
    if (collegeFee && remainingForCollege > 0) {
      const allocate = Math.min(10000, remainingForCollege)
      setAsideForCommitment(collegeFee.id, allocate)
    } else {
      showToast('This commitment is already fully reserved!')
    }
  }

  return (
    <>
      {/* Hero Financial Pulse Banner */}
      <section className="hero-banner">
        <div>
          <span className="soft-label">YOUR FINANCIAL PULSE</span>
          <h2>{stressLevel === 'healthy' ? "You're doing well, Riya." : 'Caution advised, Riya.'}</h2>
          <p>
            {stressLevel === 'healthy'
              ? 'Your money is moving in a healthy direction. Here is what matters today.'
              : 'Upcoming obligations are putting pressure on your safe-to-spend balance.'}
          </p>
          <Link href="/app/financial-pulse" className="inline-button">
            See your pulse breakdown <ChevronRight size={16} />
          </Link>
        </div>
        <div className={`score-ring ${stressLevel}`}>
          <strong>{pulseScore}</strong>
          <span>/ 100</span>
          <small>{pulseMomentum}</small>
        </div>
      </section>

      {/* Right Now / Next Best Action Section */}
      <div className="section-heading">
        <div>
          <span className="soft-label">RIGHT NOW</span>
          <h2>One clear next step</h2>
        </div>
        <span className="updated">Updated just now</span>
      </div>

      <section className="next-action">
        <div className="action-icon">
          {stressLevel === 'healthy' ? <PiggyBank size={24} /> : <ShieldAlert size={24} />}
        </div>
        <div className="action-content">
          <span className="tag">
            {stressLevel === 'healthy' ? 'RECOMMENDED FOR YOU' : 'CRITICAL ASSISTANCE'}
          </span>
          <h3>
            {stressLevel === 'healthy'
              ? remainingForCollege > 0
                ? `Set aside ₹${Math.min(10000, remainingForCollege).toLocaleString('en-IN')} for your ${collegeFee?.title || 'college fee'}`
                : 'Emergency buffer rhythm is active'
              : 'Pause discretionary credit and adjust payment timeline'}
          </h3>
          <p>
            {stressLevel === 'healthy'
              ? collegeFee
                ? `You have ₹${remainingForCollege.toLocaleString('en-IN')} remaining on your ${collegeFee.title} due on ${collegeFee.dueDate}. Moving a little today keeps it comfortable.`
                : 'All current commitments are safely insulated.'
              : '46% of your monthly cashflow is committed to existing obligations. Vani-Fi has suppressed high-interest credit cards.'}
          </p>
          <div className="action-button-row">
            {stressLevel === 'healthy' && remainingForCollege > 0 && (
              <button className="button teal-button" onClick={handleQuickSetAside}>
                Set aside ₹{Math.min(10000, remainingForCollege).toLocaleString('en-IN')}
              </button>
            )}
            <button
              className="ghost-button"
              onClick={() => router.push(stressLevel === 'healthy' ? '/app/commitments' : '/app/for-you')}
            >
              {stressLevel === 'healthy' ? 'Review commitment' : 'View financial assistance'}
            </button>
          </div>
        </div>

        {collegeFee && (
          <div className="action-stat">
            <strong>₹{(collegeFee.amount / 1000).toFixed(0)}k</strong>
            <span>due {collegeFee.dueDate}</span>
          </div>
        )}
      </section>

      {/* Dashboard Bento Grid */}
      <div className="dashboard-grid">
        {/* Safe to Spend Panel */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="soft-label">SAFE-TO-SPEND</span>
              <h3>₹{safeToSpend.toLocaleString('en-IN')}</h3>
            </div>
            <Link href="/app/money" className="arrow-button" aria-label="Go to Money">
              <ArrowRight size={17} />
            </Link>
          </div>
          <p className="muted">Available after future commitments & reserve buffer</p>

          <div className="spend-bar">
            <span
              style={{
                width: `${Math.min(100, Math.round((safeToSpend / (currentBalance || 1)) * 100))}%`,
              }}
            />
          </div>
          <div className="bar-labels">
            <span>Liquid: ₹{currentBalance.toLocaleString('en-IN')}</span>
            <span>Safe: ₹{safeToSpend.toLocaleString('en-IN')}</span>
          </div>
        </section>

        {/* Upcoming Commitments Panel */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="soft-label">UPCOMING COMMITMENTS</span>
              <h3>₹{totalUpcomingCommitments.toLocaleString('en-IN')}</h3>
            </div>
            <Link href="/app/commitments" className="arrow-button" aria-label="Go to Commitments">
              <ArrowRight size={17} />
            </Link>
          </div>
          <p className="muted">Across {commitments.length} planned commitments</p>

          <div className="mini-list">
            {commitments.slice(0, 3).map((c, i) => (
              <span key={c.id}>
                <i className={`dot ${i === 0 ? 'coral' : i === 1 ? 'teal' : 'amber'}`} />
                {c.title} <b>₹{c.amount.toLocaleString('en-IN')}</b>
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* Recent Activity / Money Movement Panel */}
      <section className="panel transactions">
        <div className="panel-heading">
          <div>
            <span className="soft-label">RECENT ACTIVITY</span>
            <h3>Money movement</h3>
          </div>
          <Link href="/app/money" className="text-link">
            View all transactions <ArrowRight size={15} />
          </Link>
        </div>

        <div className="transaction-list">
          {transactions.slice(0, 4).map(t => (
            <div className="transaction" key={t.id}>
              <div className="transaction-icon">{t.title[0]}</div>
              <div>
                <b>{t.title}</b>
                <span>
                  {t.category} · {t.date}
                </span>
              </div>
              <strong className={t.type === 'income' ? 'positive' : ''}>
                {t.amount > 0 ? `+₹${t.amount.toLocaleString('en-IN')}` : `-₹${Math.abs(t.amount).toLocaleString('en-IN')}`}
              </strong>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Add Commitment Modal */}
      <AddCommitmentModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </>
  )
}
