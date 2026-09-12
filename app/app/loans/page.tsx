'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Volume2,
  Lock,
  RefreshCw,
  HelpCircle,
} from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'
import { submitLoanApplicationService, verifyOtp } from '@/services/mock-api'

export default function LoansPage() {
  const { safeToSpend, submitLoanApplication, showToast, stressLevel } = useFinancial()

  const [step, setStep] = useState<number>(0)
  const [purpose, setPurpose] = useState('Education & Planned Expense')
  const [amount, setAmount] = useState('50000')

  // KFS Comprehension Quiz State
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null)
  const [quizError, setQuizError] = useState('')
  const [quizPassed, setQuizPassed] = useState(false)

  // OTP Verification State
  const [loanOtp, setLoanOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null)

  // Voice playback simulation
  const [speakingKfs, setSpeakingKfs] = useState(false)

  const steps = ['Need', 'Health Check', 'Key Facts (KFS)', 'Comprehension', 'OTP & Confirm', 'Success']

  const numAmount = parseFloat(amount) || 50000
  const tenureMonths = 12
  const interestRate = 14.5
  // EMI calculation: [P x R x (1+R)^N]/[(1+R)^N-1]
  const monthlyRate = interestRate / 12 / 100
  const emi = Math.round(
    (numAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  )
  const totalRepayment = emi * tenureMonths
  const processingFee = Math.round(numAmount * 0.015)

  // Spoken vernacular explanation
  const handleVoiceExplain = () => {
    setSpeakingKfs(true)
    showToast('वाणी के.एफ.एस. विवरण पढ़ रही है...')
    setTimeout(() => {
      setSpeakingKfs(false)
      showToast('KFS audio explanation complete.')
    }, 2500)
  }

  // Comprehension check handler
  const handleValidateComprehension = () => {
    if (selectedQuizOption === `₹${emi.toLocaleString('en-IN')}`) {
      setQuizPassed(true)
      setQuizError('')
      showToast('Comprehension confirmed! Proceeding to signature.')
      setStep(4)
    } else {
      setQuizError(
        `Incorrect amount. Based on your 14.5% annual rate, your monthly EMI is exactly ₹${emi.toLocaleString('en-IN')}. Please verify before continuing.`
      )
    }
  }

  // Submit loan application with OTP
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loanOtp.length !== 6) {
      setOtpError('Please enter the 6-digit verification code (e.g. 123456).')
      return
    }

    setIsSubmitting(true)
    setOtpError('')

    try {
      await verifyOtp(loanOtp)
      const app = await submitLoanApplicationService({
        amount: numAmount,
        tenureMonths,
        interestRate,
        emi,
        totalRepayment,
        processingFee,
        purpose,
      })

      submitLoanApplication({
        amount: numAmount,
        tenureMonths,
        interestRate,
        emi,
        totalRepayment,
        processingFee,
        purpose,
      })

      setSubmittedAppId(app.applicationId)
      setIsSubmitting(false)
      setStep(5)
    } catch (err: any) {
      setIsSubmitting(false)
      setOtpError(err.message || 'Verification failed. Try again.')
    }
  }

  if (stressLevel === 'stressed') {
    return (
      <section className="loan-flow">
        <div className="loan-panel centered loan-guardrail" role="alert">
          <div className="loan-alert">
            <div className="warning-icon">!</div>
            <div>
              <b>New borrowing is paused for your safety</b>
              <p>
                Aapki current financial situation ko dekhte hue naya loan lena abhi risk badha sakta hai. We can help you review safer options first.
              </p>
            </div>
          </div>

          <h2>Let&apos;s protect your financial flexibility.</h2>
          <p>
            Commercial credit offers are suppressed while financial stress is active. Your existing money and commitments remain unchanged.
          </p>

          <div className="step-actions-center">
            <Link href="/app/for-you" className="button teal-button">
              View support options <ArrowRight size={16} />
            </Link>
            <Link href="/app/commitments" className="ghost-button">
              Review commitments
            </Link>
            <Link href="/app/assistant" className="ghost-button">
              Talk to Vani
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="loan-flow">
      {/* Progress Stepper */}
      <div className="loan-progress">
        {steps.map((s, i) => (
          <span key={s} className={i <= step ? 'done' : ''}>
            <i>{i < step ? <Check size={12} /> : i + 1}</i>
            {s}
          </span>
        ))}
      </div>

      {/* Step 0: Purpose & Amount */}
      {step === 0 && (
        <div className="loan-panel">
          <span className="soft-label">BORROWING WITH CONTEXT</span>
          <h2>What would make things easier?</h2>
          <p>
            Tell us what you need. Vani checks what is safe for your situation, not just what you are eligible for.
          </p>

          <div className="loan-amount-input-box">
            <label htmlFor="loan-amount">Desired amount</label>
            <div className="amount-field-wrap">
              <span>₹</span>
              <input
                id="loan-amount"
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="5000"
                max="200000"
              />
            </div>
          </div>

          <div className="loan-options">
            <button
              className={purpose === 'Education & Planned Expense' ? 'selected' : ''}
              onClick={() => {
                setPurpose('Education & Planned Expense')
                setStep(1)
              }}
            >
              <span>🎓</span> A planned expense
              <small>Education, medical, or family milestone</small>
            </button>

            <button
              className={purpose === 'Cashflow Bridge' ? 'selected' : ''}
              onClick={() => {
                setPurpose('Cashflow Bridge')
                setStep(1)
              }}
            >
              <span>↗</span> Manage cash flow
              <small>Bridge a short-term liquidity gap</small>
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Health Check */}
      {step === 1 && (
        <div className="loan-panel centered">
          <div className="loan-alert">
            <div className="warning-icon">!</div>
            <div>
              <b>A quick, honest affordability check</b>
              <p>
                Based on your upcoming commitments and safe-to-spend limit (₹{safeToSpend.toLocaleString('en-IN')}), a new loan will add ₹{emi.toLocaleString('en-IN')}/mo in fixed obligations.
              </p>
            </div>
          </div>

          <h2>Let's look at safer options first.</h2>
          <p>
            Vani-Fi does not penalize you for pausing or exploring alternatives. If you still need this credit, you can proceed with full transparency.
          </p>

          <div className="step-actions-center">
            <button className="button teal-button" onClick={() => setStep(2)}>
              Review Key Facts Statement <ArrowRight size={16} />
            </button>
            <Link href="/app/commitments" className="ghost-button">
              Explore saving towards this goal instead
            </Link>
          </div>
        </div>
      )}

      {/* Step 2: Key Facts Statement (KFS) */}
      {step === 2 && (
        <div className="loan-panel">
          <div className="kfs-header-row">
            <div>
              <span className="soft-label">STANDARDIZED RBI KEY FACTS STATEMENT</span>
              <h2>Key Facts Statement (KFS)</h2>
            </div>
            <button
              className={`button ${speakingKfs ? 'teal-button' : 'ghost-button'}`}
              onClick={handleVoiceExplain}
              title="Listen to vernacular audio explanation of KFS"
            >
              <Volume2 size={16} /> {speakingKfs ? 'Explaining in Hindi...' : 'Hear explanation'}
            </button>
          </div>

          <p className="kfs-intro">
            This Key Facts Statement outlines all fees, interest rates, and total repayments in plain language. Voice explanation supplements this standardized document.
          </p>

          <div className="kfs">
            <div>
              <span>Loan Amount</span>
              <strong>₹{numAmount.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span>Monthly EMI</span>
              <strong>₹{emi.toLocaleString('en-IN')} / mo</strong>
            </div>
            <div>
              <span>Annual Percentage Rate (APR)</span>
              <strong>{interestRate}% p.a.</strong>
            </div>
            <div>
              <span>Total Repayment (Principal + Interest)</span>
              <strong>₹{totalRepayment.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span>One-Time Processing Fee</span>
              <strong>₹{processingFee.toLocaleString('en-IN')} + GST</strong>
            </div>
            <div>
              <span>Cool-off Period</span>
              <strong className="positive">3 Days (Penalty-free exit)</strong>
            </div>
          </div>

          <div className="modal-actions-split">
            <button className="ghost-button" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="button teal-button" onClick={() => setStep(3)}>
              Proceed to Comprehension Check <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: KFS Comprehension Validation Quiz */}
      {step === 3 && (
        <div className="loan-panel">
          <span className="soft-label">RESPONSIBLE LENDING CHECK</span>
          <h2>Verify your understanding</h2>
          <p className="kfs-intro">
            Before signing any agreement, please confirm your understanding of the financial terms:
          </p>

          <div className="quiz-container">
            <h3 className="quiz-question">What will your monthly repayment (EMI) be?</h3>

            <div className="quiz-options-list">
              {[
                `₹${(emi - 350).toLocaleString('en-IN')}`,
                `₹${emi.toLocaleString('en-IN')}`,
                `₹${(emi + 650).toLocaleString('en-IN')}`,
              ].map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`choice ${selectedQuizOption === opt ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedQuizOption(opt)
                    setQuizError('')
                  }}
                >
                  <span>{opt} per month</span>
                  {selectedQuizOption === opt && <Check size={16} />}
                </button>
              ))}
            </div>

            {quizError && (
              <div className="modal-error" role="alert">
                <AlertTriangle size={16} />
                <span>{quizError}</span>
              </div>
            )}
          </div>

          <div className="modal-actions-split">
            <button className="ghost-button" onClick={() => setStep(2)}>
              Back to KFS
            </button>
            <button
              className="button teal-button"
              disabled={!selectedQuizOption}
              onClick={handleValidateComprehension}
            >
              Verify & Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: OTP Verification & Final Confirmation */}
      {step === 4 && (
        <div className="loan-panel centered">
          <div className="success-check">
            <Lock size={26} />
          </div>

          <span className="soft-label">ELECTRONIC AUTHORIZATION</span>
          <h2>Confirm your application</h2>
          <p>
            Enter the 6-digit authorization code sent to your registered mobile number. For demo, use <strong>123456</strong>.
          </p>

          <div className="confirm-summary-pill">
            <span>Amount: <strong>₹{numAmount.toLocaleString('en-IN')}</strong></span>
            <span>EMI: <strong>₹{emi.toLocaleString('en-IN')}/mo</strong></span>
            <span>Tenure: <strong>12 Months</strong></span>
          </div>

          {otpError && (
            <div className="modal-error">
              <AlertTriangle size={15} />
              <span>{otpError}</span>
            </div>
          )}

          <form onSubmit={handleFinalSubmit} className="loan-otp-form">
            <input
              type="text"
              className="entry-input otp-input"
              maxLength={6}
              placeholder="123456"
              value={loanOtp}
              onChange={e => setLoanOtp(e.target.value.replace(/[^0-9]/g, ''))}
              required
            />

            <div className="step-actions-center">
              <button
                type="submit"
                className="button teal-button full"
                disabled={isSubmitting || loanOtp.length !== 6}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} /> Submitting application...
                  </>
                ) : (
                  <>
                    Confirm and Submit Application <ArrowRight size={16} />
                  </>
                )}
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setStep(3)}
                disabled={isSubmitting}
              >
                Back to comprehension check
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 5: True Success State */}
      {step === 5 && (
        <div className="loan-panel centered">
          <div className="success-check green">
            <CheckCircle2 size={36} />
          </div>

          <span className="soft-label">LOAN APPLICATION REGISTERED</span>
          <h2>Application submitted securely!</h2>
          <p>
            Reference ID: <strong>{submittedAppId}</strong>. Your standardized Key Facts Statement has been securely logged.
          </p>

          <div className="application-status-card">
            <div className="status-row">
              <span>Status:</span>
              <strong className="positive">Statutory 3-Day Cool-off Active</strong>
            </div>
            <div className="status-row">
              <span>Approved Amount:</span>
              <strong>₹{numAmount.toLocaleString('en-IN')}</strong>
            </div>
            <div className="status-row">
              <span>Disbursement Destination:</span>
              <strong>HDFC Bank Salary Account ••• 4821</strong>
            </div>
            <div className="status-row">
              <span>Penalty-Free Cancellation Window:</span>
              <span>Until 15 September 2026, 11:59 PM</span>
            </div>
          </div>

          <div className="step-actions-center">
            <Link href="/app" className="button teal-button">
              Return to Dashboard
            </Link>
            <button
              className="ghost-button"
              onClick={() => {
                setStep(0)
                setSelectedQuizOption(null)
                setLoanOtp('')
                setQuizPassed(false)
              }}
            >
              Run another borrowing simulation
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
