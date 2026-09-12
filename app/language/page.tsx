'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight, LockKeyhole } from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'
import { Language } from '@/lib/translations'

export default function LanguageSelectPage() {
  const router = useRouter()
  const { language, setLanguage } = useFinancial()

  const handleSelect = (lang: Language) => {
    setLanguage(lang)
  }

  return (
    <main className="landing entry-shell">
      <div className="entry-brand">
        <span className="brand-mark">V</span>
        <strong>VANI-FI</strong>
      </div>

      <div className="entry-card">
        <span className="soft-label">ACCESSIBLE BHARAT</span>
        <h1>Choose your <em>language.</em></h1>
        <p className="entry-copy">
          Select the language you feel most comfortable discussing your money in. You can change this anytime.
        </p>

        <div className="choice-list">
          {(['English', 'हिन्दी', 'ગુજરાતી'] as Language[]).map(l => (
            <button
              key={l}
              type="button"
              className={`choice ${language === l ? 'active' : ''}`}
              onClick={() => handleSelect(l)}
            >
              <span>{l}</span>
              {language === l && <Check size={18} />}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="button teal-button full"
          onClick={() => router.push('/app')}
        >
          Confirm and enter Vani-Fi <ArrowRight size={16} />
        </button>

        <Link href="/" className="back-link">
          Back to Home
        </Link>
      </div>

      <p className="entry-foot">
        <LockKeyhole size={13} /> Your data stays yours. Consent comes before connection.
      </p>
    </main>
  )
}
