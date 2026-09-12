'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  PiggyBank,
  Check,
  LockKeyhole,
  Sparkles,
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="landing">
      {/* Navigation */}
      <header className="landing-nav">
        <div className="brand dark">
          <span className="brand-mark">V</span>
          <span>VANI-FI</span>
          <small>Financial intelligence for Bharat</small>
        </div>

        <nav>
          <a href="#intelligence">Product</a>
          <a href="#works">How it works</a>
          <a href="#trust">Trust & safety</a>
        </nav>

        <Link href="/login" className="button dark-button">
          Explore Vani-Fi <ArrowRight size={16} />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-copy">
          <div className="pill">
            <span /> Voice-first · Consent-led · Explainable AI
          </div>
          <h1>
            A bank that understands <em>what you need next.</em>
          </h1>
          <p>
            Vani-Fi turns everyday financial signals into one clear, responsible next step — in the language people are most comfortable with.
          </p>

          <div className="hero-actions">
            <Link href="/login" className="button dark-button">
              See the experience <ArrowRight size={16} />
            </Link>
            <a href="#works" className="text-link">
              View how it works
            </a>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="hero-preview">
          <div className="preview-top">
            <span>Financial pulse</span>
            <span className="status-dot">● Live</span>
          </div>

          <div className="pulse-score">
            <strong>89</strong>
            <div>
              <b>Good financial momentum</b>
              <span>Continuous cashflow scan</span>
            </div>
          </div>

          <div className="metric-row">
            <div>
              <span>Liquidity</span>
              <b className="positive">Strong</b>
            </div>
            <div>
              <span>Income</span>
              <b className="positive">Stable</b>
            </div>
            <div>
              <span>Debt</span>
              <b className="amber">Moderate</b>
            </div>
          </div>

          <div className="preview-line">
            <span>Safe-to-Spend Balance</span>
            <strong>₹50,000</strong>
          </div>
          <div className="preview-line soft">
            <span>Upcoming Commitments (Insulated)</span>
            <strong>₹75,850</strong>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="trust-strip">
        <span>Built on trust</span>
        <b>● Consent-led</b>
        <b>● Non-predatory</b>
        <b>● Bharat-ready</b>
        <b>● Explainable AI</b>
      </section>

      {/* Problem Section */}
      <section id="works" className="landing-section">
        <div className="section-kicker">THE PROBLEM</div>
        <h2>
          Banks have the data.<br />
          <em>Customers need the intelligence.</em>
        </h2>

        <div className="problem-grid">
          <div className="problem">
            <span>01</span>
            <h3>Generic banking</h3>
            <p>Everyone gets the same offers, regardless of what is actually happening in their personal financial life.</p>
          </div>
          <div className="problem">
            <span>02</span>
            <h3>Financial overload</h3>
            <p>Balances and transactions are scattered. The safe amount you can spend today without touching tomorrow’s fees is never clear.</p>
          </div>
          <div className="problem">
            <span>03</span>
            <h3>Reactive banking</h3>
            <p>Most support arrives after financial stress appears. Vani-Fi sees the signals earlier and protects your buffer.</p>
          </div>
        </div>
      </section>

      {/* Flow & Intelligence Section */}
      <section id="intelligence" className="intelligence">
        <div>
          <div className="section-kicker">THE VANI-FI DIFFERENCE</div>
          <h2>
            From financial data<br />
            <em>to a better next step.</em>
          </h2>
          <p>Vani-Fi brings the signals together, explains what they mean, and leaves the decision with you.</p>
        </div>

        <div className="flow">
          <span>TRANSACTIONS</span>
          <ArrowRight />
          <span>FINANCIAL STATE</span>
          <ArrowRight />
          <span>CUSTOMER NEED</span>
          <ArrowRight />
          <span className="flow-accent">NEXT BEST ACTION</span>
        </div>
      </section>

      {/* Responsible AI Guardrail Section */}
      <section id="trust" className="responsible">
        <div className="responsible-card">
          <div>
            <div className="section-kicker">RESPONSIBLE BY DESIGN</div>
            <h2>
              AI that knows<br />
              <em>when not to sell.</em>
            </h2>
            <p>
              When money is tight, Vani-Fi does not push another high-interest credit card. It helps you understand the pressure and find a safer path.
            </p>
            <Link href="/app/for-you" className="button mint-button">
              Explore the experience <ArrowRight size={16} />
            </Link>
          </div>

          <div className="stress-card">
            <div className="stress-title">
              <span className="warning-icon">!</span>
              <div>
                <b>Financial stress detected</b>
                <small>We noticed a few signals worth looking at</small>
              </div>
            </div>

            <div className="signal">
              <span>Income</span>
              <b className="bad"><TrendingDown size={15} /> Declining</b>
            </div>
            <div className="signal">
              <span>Debt</span>
              <b className="bad"><TrendingUp size={15} /> Increasing</b>
            </div>
            <div className="signal">
              <span>Liquidity</span>
              <b className="bad"><TrendingDown size={15} /> Low</b>
            </div>

            <div className="recommend">
              <small>RECOMMENDED ACTION</small>
              <strong>ASSIST & PROTECT</strong>
              <span>Not a new loan or commercial card</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="brand dark">
          <span className="brand-mark">V</span>
          <span>VANI-FI</span>
        </div>
        <span>The next generation of banking that understands your financial life. Built for Hackout 2026.</span>
        <Link href="/login" className="button dark-button">
          Enter Vani-Fi <ArrowRight size={16} />
        </Link>
      </footer>
    </main>
  )
}
