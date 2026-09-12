'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Landmark, LockKeyhole, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'
import { connectAccount } from '@/services/mock-api'

export default function OnboardingConnectPage() {
  const router = useRouter()
  const { showToast } = useFinancial()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connectAccount('4821')
      showToast('HDFC Account connected securely via Account Aggregator!')
      router.push('/app')
    } catch (e) {
      setIsConnecting(false)
    }
  }

  return (
    <main className="landing entry-shell">
      <div className="entry-brand">
        <span className="brand-mark">V</span>
        <strong>VANI-FI · 3/3</strong>
      </div>

      <div className="entry-card">
        <span className="soft-label">ACCOUNT AGGREGATOR</span>
        <h1>Connect your <em>primary account.</em></h1>
        <p className="entry-copy">
          Vani-Fi links with your salary account via RBI-regulated Account Aggregator protocols with zero withdrawal authority.
        </p>

        <div className="connect-bank-box">
          <div className="bank-preview-item">
            <Landmark size={24} className="teal" />
            <div>
              <strong>HDFC Bank Salary Account</strong>
              <span>Account ending in ••• 4821</span>
            </div>
            <span className="ready-tag">Ready to link</span>
          </div>

          <div className="aa-trust-note">
            <LockKeyhole size={14} />
            <span>Read-only statements & balances. Zero withdrawal capability.</span>
          </div>
        </div>

        <button
          type="button"
          className="button teal-button full"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <RefreshCw className="animate-spin" size={16} /> Connecting securely...
            </>
          ) : (
            <>
              Connect & enter dashboard <ArrowRight size={16} />
            </>
          )}
        </button>

        <Link href="/onboarding/consent" className="back-link">
          Back to consent settings
        </Link>
      </div>

      <p className="entry-foot">
        <LockKeyhole size={13} /> Your data stays yours. Consent comes before connection.
      </p>
    </main>
  )
}
