'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, ShieldCheck, LockKeyhole } from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <main className="landing">
      <header className="landing-nav">
        <Link href="/" className="brand dark">
          <span className="brand-mark">V</span>
          <span>VANI-FI</span>
          <small>Financial intelligence for Bharat</small>
        </Link>
        <nav>
          <Link href="/product">Product</Link>
          <Link href="/how-it-works" className="active-nav-link">How it works</Link>
          <Link href="/trust">Trust & safety</Link>
        </nav>
        <Link href="/login" className="button dark-button">
          Explore Vani-Fi <ArrowRight size={16} />
        </Link>
      </header>

      <section className="landing-section">
        <div className="section-kicker">STEP-BY-STEP PROCESS</div>
        <h2>
          How Vani-Fi transforms<br />
          <em>banking into understanding.</em>
        </h2>

        <div className="flow-steps-grid">
          <div className="flow-step-card panel">
            <span className="step-num">Step 1</span>
            <h3>Consent-Led Ingestion</h3>
            <p>You link your primary bank account via RBI-regulated Account Aggregators. Vani-Fi gets read-only access to balances and transactions. Zero withdrawal capability.</p>
          </div>

          <div className="flow-step-card panel">
            <span className="step-num">Step 2</span>
            <h3>Real-Time State Mapping</h3>
            <p>Every transaction updates your Financial Pulse score, tracking liquidity ratio, income stability, and debt obligations in real time.</p>
          </div>

          <div className="flow-step-card panel">
            <span className="step-num">Step 3</span>
            <h3>Future Commitment Awareness</h3>
            <p>Tell Vani via voice or text about upcoming college fees or rent. Vani reserves these funds virtually so you know your true Safe-to-Spend limit.</p>
          </div>

          <div className="flow-step-card panel">
            <span className="step-num">Step 4</span>
            <h3>Responsible Decision Layer</h3>
            <p>Vani-Fi evaluates whether you need an OFFER, ASSIST, PROTECT, WARN, or DO NOTHING. If you are under financial stress, commercial loan offers are suppressed.</p>
          </div>
        </div>

        <div className="cta-center-wrap">
          <Link href="/login" className="button teal-button">
            Try the Experience <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  )
}
