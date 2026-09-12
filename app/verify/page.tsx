'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, LockKeyhole, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react'

export default function VerifyOtpPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(30)
  const [resendNotice, setResendNotice] = useState('')

  useEffect(() => {
    if (timer <= 0) return
    const interval = setInterval(() => {
      setTimer(t => t - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timer])

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Please enter the full 6-digit verification code.')
      return
    }

    setIsLoading(true)
    setError('')

    setTimeout(() => {
      setIsLoading(false)
      router.push('/onboarding')
    }, 450)
  }

  const handleResend = () => {
    if (timer > 0) return
    setTimer(30)
    setResendNotice('A fresh verification code has been sent.')
    setTimeout(() => setResendNotice(''), 3000)
  }

  return (
    <main className="landing entry-shell">
      <div className="entry-brand">
        <span className="brand-mark">V</span>
        <strong>VANI-FI</strong>
      </div>

      <div className="entry-card">
        <span className="soft-label">SECURE VERIFICATION</span>
        <h1>Enter your <em>one-time code.</em></h1>
        <p className="entry-copy">
          We sent a 6-digit code to your registered mobile number. For demo, use <strong>123456</strong>.
        </p>

        {error && (
          <div className="form-error" role="alert">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {resendNotice && (
          <div className="resend-success" role="status">
            <CheckCircle2 size={15} />
            <span>{resendNotice}</span>
          </div>
        )}

        <form onSubmit={handleVerify}>
          <label className="field-label" htmlFor="otp">Verification code</label>
          <input
            id="otp"
            className="entry-input otp-input"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={e => {
              setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))
              if (error) setError('')
            }}
            required
            autoFocus
          />

          <button
            type="submit"
            className="button teal-button full"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying code...' : 'Verify and continue'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="otp-resend-row">
          {timer > 0 ? (
            <span>Resend code in {timer}s</span>
          ) : (
            <button type="button" className="resend-btn" onClick={handleResend}>
              <RefreshCw size={13} /> Resend OTP
            </button>
          )}
        </div>

        <Link href="/login" className="back-link">
          Use a different mobile number
        </Link>
      </div>

      <p className="entry-foot">
        <LockKeyhole size={13} /> Your data stays yours. Consent comes before connection.
      </p>
    </main>
  )
}
