'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  LockKeyhole,
  Bell,
  Check,
  AlertTriangle,
  XOctagon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'
import { ReportIssueModal } from '@/components/modals/report-issue-modal'

export default function ProtectionPage() {
  const { fraudAlerts, resolveFraudAlert, stressLevel, showToast } = useFinancial()
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [cardLocked, setCardLocked] = useState(false)

  const toggleCardLock = () => {
    setCardLocked(prev => !prev)
    showToast(cardLocked ? 'Virtual card unlocked' : 'Virtual card locked for security')
  }

  return (
    <>
      {/* Protection Hero */}
      <section className="protection-hero">
        <div className="protect-badge">
          <ShieldCheck size={32} />
        </div>
        <div>
          <span className="soft-label">CONTINUOUS INTEGRITY SHIELD</span>
          <h2>Protection Centre</h2>
          <p>
            Vani distinguishes between <strong>Financial Stress</strong> (liquidity pressure) and <strong>Fraud Risk</strong> (anomalous transactions).
          </p>
        </div>
      </section>

      {/* Fraud Alert Section (Separate from financial stress) */}
      <div className="section-heading">
        <div>
          <span className="soft-label">FRAUD & ANOMALY SURVEILLANCE</span>
          <h2>Active Security Pings</h2>
        </div>
      </div>

      <div className="security-alerts-wrap">
        {fraudAlerts.map(alert => (
          <div key={alert.id} className={`panel fraud-alert-panel ${alert.status}`}>
            <div className="alert-header">
              <div className="alert-icon-box">
                {alert.status === 'pending' ? (
                  <AlertTriangle size={20} className="coral" />
                ) : alert.status === 'blocked' ? (
                  <XOctagon size={20} className="coral" />
                ) : (
                  <CheckCircle2 size={20} className="teal" />
                )}
              </div>
              <div className="alert-main-text">
                <div className="alert-title-row">
                  <b>{alert.merchant}</b>
                  <span className={`status-pill ${alert.status}`}>
                    {alert.status === 'pending'
                      ? 'Action Required'
                      : alert.status === 'blocked'
                      ? 'Merchant Blocked'
                      : 'Verified Safe'}
                  </span>
                </div>
                <p>{alert.reason}</p>
                <div className="alert-meta">
                  <span>Amount: <strong>₹{alert.amount.toLocaleString('en-IN')}</strong></span>
                  <span>Time: {alert.time}</span>
                  <span>Location: {alert.location}</span>
                </div>
              </div>
            </div>

            {alert.status === 'pending' && (
              <div className="alert-actions">
                <button
                  className="button danger-button"
                  onClick={() => resolveFraudAlert(alert.id, 'blocked')}
                >
                  <XOctagon size={15} /> Block Merchant & Freeze Card
                </button>
                <button
                  className="button teal-button"
                  onClick={() => resolveFraudAlert(alert.id, 'verified')}
                >
                  <Check size={15} /> Verify as Legitimate
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Security Controls Grid */}
      <div className="security-grid">
        <div className="panel security-item">
          <LockKeyhole size={22} className="teal" />
          <div>
            <b>Virtual Card Security</b>
            <span>{cardLocked ? 'Card is locked (No online debits)' : 'Active with ₹50,000 limit'}</span>
          </div>
          <button
            className={`button ${cardLocked ? 'teal-button' : 'ghost-button'}`}
            onClick={toggleCardLock}
          >
            {cardLocked ? 'Unlock Card' : 'Freeze Card'}
          </button>
        </div>

        <div className="panel security-item">
          <Bell size={22} className="teal" />
          <div>
            <b>Real-time Instant Alerts</b>
            <span>SMS & Push alerts active for transactions &gt; ₹1,000</span>
          </div>
          <strong className="positive">Active</strong>
        </div>
      </div>

      {/* Recent Security Audits */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="soft-label">VERIFIED ACTIVITY LOG</span>
            <h3>Automated Safeguard Checks</h3>
          </div>
        </div>

        <div className="check-row">
          <div className="check-icon">
            <Check size={16} />
          </div>
          <div>
            <b>New device sign-in</b>
            <span>Apple iPhone 15 · Mumbai, India · 10 Sep 2026</span>
          </div>
          <strong>Verified via 2FA</strong>
        </div>

        <div className="check-row">
          <div className="check-icon">
            <Check size={16} />
          </div>
          <div>
            <b>UPI payment velocity scan</b>
            <span>Daily spending velocity is within safe variance</span>
          </div>
          <strong className="positive">Normal</strong>
        </div>

        <div className="check-row">
          <div className="check-icon">
            <Check size={16} />
          </div>
          <div>
            <b>Account Aggregator Consent Expiry</b>
            <span>Valid until 12 Dec 2026 · Encrypted end-to-end</span>
          </div>
          <strong>Active</strong>
        </div>
      </section>

      {/* Report Issue Button */}
      <div className="report-issue-wrap">
        <button
          className="danger-link-btn"
          onClick={() => setReportModalOpen(true)}
        >
          <AlertCircle size={15} /> Report a Suspicious Transaction or Security Dispute
        </button>
      </div>

      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </>
  )
}
