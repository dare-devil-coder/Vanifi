'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, PiggyBank, Sparkles, ShieldCheck, Check, ArrowLeft } from 'lucide-react'

export default function ProductPage() {
  return (
    <main className="landing">
      <header className="landing-nav">
        <Link href="/" className="brand dark">
          <span className="brand-mark">V</span>
          <span>VANI-FI</span>
          <small>Financial intelligence for Bharat</small>
        </Link>
        <nav>
          <Link href="/product" className="active-nav-link">Product</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/trust">Trust & safety</Link>
        </nav>
        <Link href="/login" className="button dark-button">
          Explore Vani-Fi <ArrowRight size={16} />
        </Link>
      </header>

      <section className="landing-section">
        <div className="section-kicker">CORE PRODUCT ARCHITECTURE</div>
        <h2>
          Six intelligent layers,<br />
          <em>one responsible copilot.</em>
        </h2>
        <p className="landing-subtext">
          Vani-Fi unifies your financial life through six dedicated layers that communicate in real-time.
        </p>

        <div className="problem-grid">
          <div className="problem">
            <span>01</span>
            <h3>Financial Pulse</h3>
            <p>Continuous evaluation of your cashflow volatility, debt ratio, and reserve cushion. Not a credit score, but a health benchmark.</p>
          </div>
          <div className="problem">
            <span>02</span>
            <h3>Safe-to-Spend</h3>
            <p>Calculates the true discretionary amount you can safely spend today after reserving funds for upcoming commitments.</p>
          </div>
          <div className="problem">
            <span>03</span>
            <h3>Virtual Commitments</h3>
            <p>Pre-funds upcoming fees, rent, and insurance. Earmarks funds without physically moving or withdrawing money.</p>
          </div>
          <div className="problem">
            <span>04</span>
            <h3>Next Best Action</h3>
            <p>A decision engine that decides whether to OFFER, ASSIST, PROTECT, WARN, or DO NOTHING based on your real cashflow.</p>
          </div>
          <div className="problem">
            <span>05</span>
            <h3>Vernacular Voice</h3>
            <p>Natural conversational interaction in Hindi, English, and Gujarati that extracts financial intents with explicit confirmation.</p>
          </div>
          <div className="problem">
            <span>06</span>
            <h3>Responsible Lending</h3>
            <p>RBI-compliant Key Facts Statement (KFS), affordability checks, comprehension validation, and cool-off rights.</p>
          </div>
        </div>

        <div className="cta-center-wrap">
          <Link href="/login" className="button teal-button">
            Enter Interactive Demo <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  )
}
