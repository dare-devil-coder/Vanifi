'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'

export default function FinancialPulsePage() {
  const { pulseScore, pulseBand, pulseMomentum, pulseDrivers, metrics, stressLevel, setStressLevel, showToast, t } = useFinancial()

  // Animated score counter for smooth score entrance
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    let start = 0
    const end = pulseScore
    const duration = 700
    const stepTime = 20
    const totalSteps = duration / stepTime
    const increment = (end - start) / totalSteps

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayScore(end)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.round(start))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [pulseScore])

  const toggleStress = () => {
    const newLevel = stressLevel === 'healthy' ? 'stressed' : 'healthy'
    setStressLevel(newLevel)
    showToast(`Switched customer mode to: ${newLevel.toUpperCase()}`)
  }

  return (
    <>
      <div className="pulse-layout">
        {/* Main Score & Chart Panel */}
        <section className="pulse-main panel">
          <div className="pulse-header">
            <div>
              <span className="soft-label">{t('financialHealth')}</span>
              <h2>{pulseBand === 'excellent' || pulseBand === 'healthy' ? 'Healthy financial momentum' : pulseBand === 'watch' ? 'A little more breathing room would help' : 'Financial pressure needs attention'}</h2>
              <p>{t('continuousEvaluation')}</p>
            </div>
            <div className="big-score">
              <strong>{displayScore}</strong>
              <span>/ 100</span>
            </div>
          </div>

          <div className="chart">
            <div className="chart-grid">
              <i />
              <i />
              <i />
              <i />
            </div>

            <svg viewBox="0 0 600 180" preserveAspectRatio="none">
              <path
                d={
                  pulseScore >= 60
                    ? 'M0 135 C70 130 75 105 140 116 S210 75 265 95 S330 35 390 65 S450 55 500 30 S560 55 600 18'
                    : 'M0 60 C70 80 140 90 210 110 S330 130 390 140 S500 155 600 165'
                }
                fill="none"
                stroke={pulseScore >= 60 ? '#0d7870' : '#dd7868'}
                strokeWidth="4"
              />
              <path
                d={
                  pulseScore >= 60
                    ? 'M0 135 C70 130 75 105 140 116 S210 75 265 95 S330 35 390 65 S450 55 500 30 S560 55 600 18 V180 H0Z'
                    : 'M0 60 C70 80 140 90 210 110 S330 130 390 140 S500 155 600 165 V180 H0Z'
                }
                fill="url(#pulseFill)"
                opacity=".22"
              />
              <defs>
                <linearGradient id="pulseFill" x1="0" x2="0" y1="0" y2="1">
                    <stop stopColor={pulseScore >= 60 ? '#0d7870' : '#dd7868'} />
                  <stop offset="1" stopColor="#e0f7f0" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            <div className="chart-labels">
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep (Current)</span>
            </div>
          </div>
        </section>

        {/* Dynamic Metric Breakdown Cards */}
        <div className="pulse-metrics">
          <div className="metric-card">
            <span>{t('liquidityBuffer')}</span>
            <strong className={metrics.liquidity.tone}>{metrics.liquidity.value}</strong>
            <small>{metrics.liquidity.detail}</small>
          </div>

          <div className="metric-card">
            <span>{t('incomeStability')}</span>
            <strong className={metrics.incomeStability.tone}>{metrics.incomeStability.value}</strong>
            <small>{metrics.incomeStability.detail}</small>
          </div>

          <div className="metric-card">
            <span>{t('debtObligations')}</span>
            <strong className={metrics.debtLoad.tone}>{metrics.debtLoad.value}</strong>
            <small>{metrics.debtLoad.detail}</small>
          </div>

          <div className="metric-card">
            <span>{t('protectionShield')}</span>
            <strong className={metrics.protection.tone}>{metrics.protection.value}</strong>
            <small>{metrics.protection.detail}</small>
          </div>
        </div>
      </div>

      {/* AI Insight Card */}
      <section className="insight-card">
        <Sparkles size={22} />
        <div>
          <span className="soft-label">{t('noticed')}</span>
          <h3>
            {pulseBand === 'healthy' || pulseBand === 'excellent'
              ? 'Your current position can support a calmer savings rhythm'
              : 'Your available flexibility needs attention'}
          </h3>
          <p>
            {pulseDrivers[0]} {pulseDrivers[1]}
          </p>
        </div>
        <button
          className="button mint-button"
          onClick={toggleStress}
          title="Demo-only override for testing responsible AI behavior"
        >
          {t('demoOverride')}: {stressLevel === 'healthy' ? t('testStress') : t('testHealthy')}
        </button>
      </section>
    </>
  )
}
