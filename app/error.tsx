'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, ArrowRight } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled Application Error:', error)
  }, [error])

  return (
    <main className="landing entry-shell">
      <div className="entry-brand">
        <span className="brand-mark">V</span>
        <strong>VANI-FI</strong>
      </div>

      <div className="entry-card centered">
        <div className="modal-error">
          <AlertCircle size={20} />
          <span>Application state encountered an unexpected condition.</span>
        </div>

        <h1>Something went <em>off track.</em></h1>
        <p className="entry-copy">
          Your financial data remains completely safe and encrypted. You can recover by resetting the current screen.
        </p>

        <div className="step-actions-center">
          <button type="button" className="button teal-button full" onClick={() => reset()}>
            <RefreshCw size={16} /> Recover and Retry
          </button>
          <Link href="/app" className="back-link">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
