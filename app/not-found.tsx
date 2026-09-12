import Link from 'next/link'
import { ArrowRight, LockKeyhole } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="landing entry-shell">
      <div className="entry-brand">
        <span className="brand-mark">V</span>
        <strong>VANI-FI</strong>
      </div>

      <div className="entry-card centered">
        <span className="soft-label">404 · PAGE NOT FOUND</span>
        <h1>This page took a wrong <em>turn.</em></h1>
        <p className="entry-copy">
          The experience or financial view you are looking for does not exist, or it has moved.
        </p>

        <div className="step-actions-center">
          <Link href="/app" className="button teal-button full">
            Return to Vani-Fi Dashboard <ArrowRight size={16} />
          </Link>
          <Link href="/" className="back-link">
            Go to Landing Page
          </Link>
        </div>
      </div>

      <p className="entry-foot">
        <LockKeyhole size={13} /> Your data stays yours. Consent comes before connection.
      </p>
    </main>
  )
}
