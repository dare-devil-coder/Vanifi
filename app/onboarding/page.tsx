'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, ShieldCheck, Landmark, LockKeyhole, RefreshCw } from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'
import { Language } from '@/lib/translations'

export default function OnboardingPage() {
  const router = useRouter()
  const { language, setLanguage, showToast } = useFinancial()
  const [step, setStep] = useState<number>(0)
  const [isConnecting, setIsConnecting] = useState(false)

  const steps = [
    {
      label: 'MAKE IT YOURS',
      title: 'How should Vani speak with you?',
      text: 'Choose the language that feels most natural. You can change this anytime in settings.',
    },
    {
      label: 'CONSENT FIRST',
      title: 'Bring your money into one picture.',
      text: 'Connect accounts only when you are ready. You will always see exactly what Vani can access.',
    },
    {
      label: 'ACCOUNT AGGREGATOR',
      title: 'Connect your primary account.',
      text: 'Vani-Fi links with your salary account via RBI-regulated Account Aggregator protocols with zero withdrawal authority.',
    },
  ]

  const handleNext = () => {
    if (step === 0) {
      setStep(1)
    } else if (step === 1) {
      setStep(2)
    } else {
      // Step 2: Connecting bank
      setIsConnecting(true)
      setTimeout(() => {
        setIsConnecting(false)
        showToast('HDFC Account connected securely via Account Aggregator!')
        router.push('/app')
      }, 700)
    }
  }

  return (
    <main className="landing entry-shell">
      <div className="entry-brand">
        <span className="brand-mark">V</span>
        <strong>VANI-FI · {step + 1}/3</strong>
      </div>

      <div className="entry-card">
        <span className="soft-label">{steps[step].label}</span>
        <h1>{steps[step].title}</h1>
        <p className="entry-copy">{steps[step].text}</p>

        {step === 0 && (
          <div className="choice-list">
            {(['English', 'हिन्दी', 'ગુજરાતી'] as Language[]).map(lang => (
              <button
                key={lang}
                type="button"
                className={`choice ${language === lang ? 'active' : ''}`}
                onClick={() => setLanguage(lang)}
              >
                <span>{lang}</span>
                {language === lang && <Check size={17} />}
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="consent-box">
            <ShieldCheck size={26} />
            <div>
              <strong>Your control, always</strong>
              <p>
                Vani explains every recommendation, asks before taking any action, and lets you disconnect whenever you choose.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="connect-bank-box">
            <div className="bank-preview-item">
              <Landmark size={24} className="teal" />
              <div>
                <strong>HDFC Bank Salary Account</strong>
                <span>Account ending in ••• 4821</span>
              </div>
              <span className="ready-tag">Ready</span>
            </div>
            <div className="aa-trust-note">
              <LockKeyhole size={14} />
              <span>Read-only statements & balances. Zero withdrawal capability.</span>
            </div>
          </div>
        )}

        <button
          type="button"
          className="button teal-button full"
          onClick={handleNext}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <RefreshCw className="animate-spin" size={16} /> Connecting securely...
            </>
          ) : step === 2 ? (
            <>
              Connect & enter dashboard <ArrowRight size={16} />
            </>
          ) : (
            <>
              Continue <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      <p className="entry-foot">
        <LockKeyhole size={13} /> Your data stays yours. Consent comes before connection.
      </p>
    </main>
  )
}
