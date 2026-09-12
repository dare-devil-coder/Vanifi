'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, LockKeyhole, Check, AlertTriangle } from 'lucide-react'

export default function TrustPage() {
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
          <Link href="/how-it-works">How it works</Link>
          <Link href="/trust" className="active-nav-link">Trust & safety</Link>
        </nav>
        <Link href="/login" className="button dark-button">
          Explore Vani-Fi <ArrowRight size={16} />
        </Link>
      </header>

      <section className="landing-section">
        <div className="section-kicker">GOVERNANCE & RESPONSIBLE AI</div>
        <h2>
          Built on trust,<br />
          <em>governed by principles.</em>
        </h2>

        <div className="problem-grid">
          <div className="problem">
            <span>01</span>
            <h3>Non-Predatory by Design</h3>
            <p>Our AI algorithms never sell high-interest credit cards or loans to users showing financial stress. We assist and protect first.</p>
          </div>
          <div className="problem">
            <span>02</span>
            <h3>Consent Comes First</h3>
            <p>You decide which accounts Vani can see. Consent can be paused or revoked at any time via Account Aggregator settings.</p>
          </div>
          <div className="problem">
            <span>03</span>
            <h3>Virtual Reservations</h3>
            <p>Commitments never withdraw money. You retain 100% control over your bank balances at all times.</p>
          </div>
          <div className="problem">
            <span>04</span>
            <h3>Explainable AI</h3>
            <p>Every single recommendation includes a "Why am I seeing this?" breakdown showing the exact financial variables considered.</p>
          </div>
          <div className="problem">
            <span>05</span>
            <h3>Vernacular Inclusivity</h3>
            <p>Designed for Bharat in Hindi, English, and Gujarati, ensuring financial clarity reaches Tier 2, 3, and 4 communities.</p>
          </div>
          <div className="problem">
            <span>06</span>
            <h3>3-Day Statutory Cool-off</h3>
            <p>All loan simulations include an explicit 3-day penalty-free cool-off period under RBI digital lending guidelines.</p>
          </div>
        </div>

        <div className="cta-center-wrap">
          <Link href="/login" className="button dark-button">
            Enter Vani-Fi <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  )
}
