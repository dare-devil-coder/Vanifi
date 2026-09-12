'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight, ShieldCheck, AlertTriangle, Check, HelpCircle, X } from 'lucide-react'
import { useFinancial, Recommendation } from '@/lib/financial-context'

export default function ForYouPage() {
  const router = useRouter()
  const { recommendations, pulseScore, stressLevel, setStressLevel, showToast, t } = useFinancial()
  const [selectedReasoning, setSelectedReasoning] = useState<Recommendation | null>(null)

  const toggleStress = () => {
    const next = stressLevel === 'healthy' ? 'stressed' : 'healthy'
    setStressLevel(next)
    showToast(`Switched customer mode to: ${next.toUpperCase()}`)
  }

  return (
    <>
      <section className="for-you-head">
        <div>
          <span className="soft-label">{t('responsibleNextBestAction')}</span>
          <h2>{t('onlyUseful')}</h2>
          <p>
            Every recommendation is generated from your real cashflow signals. When you are under pressure, Vani-Fi strictly suppresses sales.
          </p>
        </div>

        <button
          className="button mint-button"
          onClick={toggleStress}
          title="Toggle between healthy customer and stressed customer to see ethical AI behavior"
        >
          {t('simulateStress')}: {stressLevel === 'healthy' ? t('testStress') : t('testHealthy')}
        </button>
      </section>

      {/* Ethical AI Banner */}
      <div className={`responsible-state-banner ${stressLevel}`}>
        {stressLevel === 'healthy' ? (
          <div className="state-banner-content">
            <Sparkles size={20} className="teal" />
            <div>
              <strong>{t('healthyCashflow')} (Score: {pulseScore})</strong>
              <p>Recommending goal-based savings buffers and security enhancements. No predatory credit offers.</p>
            </div>
          </div>
        ) : (
          <div className="state-banner-content">
            <AlertTriangle size={20} className="coral" />
            <div>
              <strong>{t('stressGuardrail')} (Score: {pulseScore})</strong>
              <p>Commercial loan & credit card promotions are explicitly blocked. Showing assistance and budget pacing.</p>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Bento Grid */}
      <div className="recommend-grid">
        {recommendations.map(rec => {
          const isFeatured = rec.type === 'OFFER' || rec.type === 'ASSIST'
          const isDoNothing = rec.type === 'DO_NOTHING'
          const isWarn = rec.type === 'WARN'

          return (
            <article
              key={rec.id}
              className={`recommend-card ${isFeatured ? 'featured' : ''} ${isDoNothing ? 'do-nothing-card' : ''} ${isWarn ? 'caution' : ''}`}
            >
              <div className="card-top">
                <span className={`tag ${isFeatured ? 'featured-tag' : isWarn ? 'amber-tag' : 'muted-tag'}`}>
                  {rec.badge}
                </span>
                {isFeatured && <Sparkles size={22} />}
              </div>

              <h3>{rec.title}</h3>
              <p>{rec.description}</p>

              <div className="card-bottom">
                {rec.actionLabel && rec.actionRoute && (
                  <button
                    className={`button ${isFeatured ? 'teal-button' : 'dark-button'}`}
                    onClick={() => router.push(rec.actionRoute!)}
                  >
                    {rec.actionLabel} <ArrowRight size={15} />
                  </button>
                )}

                <button
                  className="why-button"
                  onClick={() => setSelectedReasoning(rec)}
                >
                  <HelpCircle size={13} /> {t('whySeeing')}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* Explainable AI Modal */}
      {selectedReasoning && (
        <div className="modal-overlay" onClick={() => setSelectedReasoning(null)} role="dialog" aria-modal="true">
          <div className="modal-card small-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="soft-label">EXPLAINABLE AI REASONING</span>
                <h2>Why Vani-Fi decided this</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelectedReasoning(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="explainable-box">
              <h4>{selectedReasoning.title}</h4>
              <p className="reason-text">{selectedReasoning.reasoning}</p>

              <div className="guardrail-quote">
                “Our AI is optimized not only to know what product to recommend, but also when NOT to recommend one.”
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="button teal-button"
                onClick={() => setSelectedReasoning(null)}
              >
                {t('gotIt')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
