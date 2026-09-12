'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ShieldCheck, LockKeyhole } from 'lucide-react'

export default function OnboardingConsentPage() {
  const router = useRouter()

  return (
    <main className="landing entry-shell">
      <div className="entry-brand">
        <span className="brand-mark">V</span>
        <strong>VANI-FI · 2/3</strong>
      </div>

      <div className="entry-card">
        <span className="soft-label">CONSENT FIRST</span>
        <h1>Bring your money into <em>one picture.</em></h1>
        <p className="entry-copy">
          Connect accounts only when you are ready. You will see exactly what Vani can access.
        </p>

        <div className="consent-box">
          <ShieldCheck size={28} />
          <div>
            <strong>Your control, always</strong>
            <p>
              Vani explains recommendations, asks before taking action, and lets you disconnect whenever you choose.
            </p>
          </div>
        </div>

        <div className="consent-list-preview">
          <div className="consent-item-pill">
            <LockKeyhole size={14} />
            <span>Read-only balances & statements. Zero withdrawal permissions.</span>
          </div>
        </div>

        <button
          type="button"
          className="button teal-button full"
          onClick={() => router.push('/onboarding/connect')}
        >
          I understand and consent <ArrowRight size={16} />
        </button>

        <Link href="/onboarding" className="back-link">
          Back to language selection
        </Link>
      </div>

      <p className="entry-foot">
        <LockKeyhole size={13} /> Your data stays yours. Consent comes before connection.
      </p>
    </main>
  )
}
