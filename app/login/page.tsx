'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, LockKeyhole, AlertCircle, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanPhone = phone.replace(/[^0-9]/g, '')

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.')
      return
    }

    setIsLoading(true)
    setError('')

    // Simulating instant OTP generation for demo
    setTimeout(() => {
      setIsLoading(false)
      router.push('/verify')
    }, 400)
  }

  return (
    <main className="landing entry-shell">
      <div className="entry-brand">
        <span className="brand-mark">V</span>
        <strong>VANI-FI</strong>
      </div>

      <div className="entry-card">
        <span className="soft-label">WELCOME BACK</span>
        <h1>Money should feel <em>clear.</em></h1>
        <p className="entry-copy">
          Sign in with your mobile number to pick up where you left off with your financial picture.
        </p>

        {error && (
          <div className="form-error" role="alert">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleContinue}>
          <label className="field-label" htmlFor="phone">Mobile number</label>
          <div className="phone-input-wrap">
            <span className="phone-prefix">+91</span>
            <input
              id="phone"
              className="entry-input phone-input"
              inputMode="numeric"
              placeholder="98765 43210"
              value={phone}
              onChange={e => {
                setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))
                if (error) setError('')
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="button teal-button full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending code...' : 'Continue with OTP'} <ArrowRight size={16} />
          </button>
        </form>

        <Link href="/" className="back-link">
          Back to Vani-Fi Home
        </Link>
      </div>

      <p className="entry-foot">
        <LockKeyhole size={13} /> Your data stays yours. Consent comes before connection.
      </p>
    </main>
  )
}
