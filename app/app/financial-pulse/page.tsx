'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'

export default function FinancialPulsePage() {
  const { pulseScore, pulseMomentum, metrics, stressLevel, setStressLevel, showToast } = useFinancial()

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
              <span className="soft-label">FINANCIAL HEALTH BENCHMARK</span>
              <h2>{pulseMomentum}</h2>
              <p>Continuous evaluation of your cashflow volatility, debt ratio, and reserve cushion.</p>
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
                  stressLevel === 'healthy'
                    ? 'M0 135 C70 130 75 105 140 116 S210 75 265 95 S330 35 390 65 S450 55 500 30 S560 55 600 18'
                    : 'M0 60 C70 80 140 90 210 110 S330 130 390 140 S500 155 600 165'
                }
                fill="none"
                stroke={stressLevel === 'healthy' ? '#0d7870' : '#dd7868'}
                strokeWidth="4"
              />
              <path
                d={
                  stressLevel === 'healthy'
                    ? 'M0 135 C70 130 75 105 140 116 S210 75 265 95 S330 35 390 65 S450 55 500 30 S560 55 600 18 V180 H0Z'
                    : 'M0 60 C70 80 140 90 210 110 S330 130 390 140 S500 155 600 165 V180 H0Z'
                }
                fill="url(#pulseFill)"
                opacity=".22"
              />
              <defs>
                <linearGradient id="pulseFill" x1="0" x2="0" y1="0" y2="1">
                  <stop stopColor={stressLevel === 'healthy' ? '#0d7870' : '#dd7868'} />
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
            <span>Liquidity Buffer</span>
            <strong className={metrics.liquidity.tone}>{metrics.liquidity.value}</strong>
            <small>{metrics.liquidity.detail}</small>
          </div>

          <div className="metric-card">
            <span>Income Stability</span>
            <strong className={metrics.incomeStability.tone}>{metrics.incomeStability.value}</strong>
            <small>{metrics.incomeStability.detail}</small>
          </div>

          <div className="metric-card">
            <span>Debt Obligations</span>
            <strong className={metrics.debtLoad.tone}>{metrics.debtLoad.value}</strong>
            <small>{metrics.debtLoad.detail}</small>
          </div>

          <div className="metric-card">
            <span>Protection Shield</span>
            <strong className={metrics.protection.tone}>{metrics.protection.value}</strong>
            <small>{metrics.protection.detail}</small>
          </div>
        </div>
      </div>

      {/* AI Insight Card */}
      <section className="insight-card">
        <Sparkles size={22} />
        <div>
          <span className="soft-label">VANI NOTICED</span>
          <h3>
            {stressLevel === 'healthy'
              ? 'Your savings rhythm is outpacing your quarterly benchmark'
              : 'Debt repayments are outpacing safe discretionary cashflow'}
          </h3>
          <p>
            {stressLevel === 'healthy'
              ? 'You saved 12% more this month than your 3-month average. Keeping this pace will fully insulate your college fee and term insurance commitments without touching reserves.'
              : 'With 46% of cashflow dedicated to fixed commitments, discretionary spending should be paused to protect essential household liquidity.'}
          </p>
        </div>
        <button
          className="button mint-button"
          onClick={toggleStress}
          title="Toggle between healthy and stressed user states to test explainable AI behavior"
        >
          Toggle Demo State ({stressLevel === 'healthy' ? 'Test Stress' : 'Test Healthy'})
        </button>
      </section>
    </>
  )
}
