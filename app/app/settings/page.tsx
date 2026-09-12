'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  LockKeyhole,
  Globe,
  Bell,
  ShieldCheck,
  Smartphone,
  LogOut,
  Sliders,
  Check,
} from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'
import { Language } from '@/lib/translations'
import { ConsentManagerModal } from '@/components/modals/consent-manager-modal'

export default function SettingsPage() {
  const router = useRouter()
  const {
    language,
    setLanguage,
    stressLevel,
    setStressLevel,
    showToast,
  } = useFinancial()

  const [consentModalOpen, setConsentModalOpen] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [biometricsEnabled, setBiometricsEnabled] = useState(true)

  const toggleVoice = () => {
    setVoiceEnabled(v => !v)
    showToast(voiceEnabled ? 'Voice responses muted' : 'Voice responses enabled')
  }

  const toggleBiometrics = () => {
    setBiometricsEnabled(b => !b)
    showToast(biometricsEnabled ? 'Biometric 2FA disabled' : 'Biometric Face ID / Fingerprint enabled')
  }

  const handleLogout = () => {
    showToast('Logged out of demo session')
    router.push('/')
  }

  return (
    <>
      {/* Profile Header */}
      <section className="settings-profile">
        <div className="avatar large">RS</div>
        <div>
          <span className="soft-label">YOUR PROFILE</span>
          <h2>Riya Sharma</h2>
          <p>riya.sharma@email.com · +91 98765 43210</p>
        </div>
      </section>

      {/* Settings Options List */}
      <div className="settings-list panel">
        {/* Preferred Language */}
        <div className="setting-item-block">
          <div className="setting-info-row">
            <div className="setting-label-icon">
              <Globe size={18} className="teal" />
              <div>
                <strong>Preferred Language</strong>
                <small>Select your vernacular comfort</small>
              </div>
            </div>
            <div className="lang-chips">
              {(['English', 'हिन्दी', 'ગુજરાતી'] as Language[]).map(l => (
                <button
                  key={l}
                  className={`chip-btn ${language === l ? 'highlight' : ''}`}
                  onClick={() => setLanguage(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Demo Simulation Mode */}
        <div className="setting-item-block">
          <div className="setting-info-row">
            <div className="setting-label-icon">
              <Sliders size={18} className="amber" />
              <div>
                <strong>Hackout Demo Mode</strong>
                <small>Simulate customer financial condition to test Responsible AI</small>
              </div>
            </div>
            <div className="lang-chips">
              <button
                className={`chip-btn ${stressLevel === 'healthy' ? 'highlight' : ''}`}
                onClick={() => {
                  setStressLevel('healthy')
                  showToast('Mode set to Healthy Customer (Score: 82)')
                }}
              >
                Healthy Customer
              </button>
              <button
                className={`chip-btn ${stressLevel === 'stressed' ? 'danger-highlight' : ''}`}
                onClick={() => {
                  setStressLevel('stressed')
                  showToast('Mode set to Stressed Customer (Score: 48, Sales Suppressed)')
                }}
              >
                Stressed Customer
              </button>
            </div>
          </div>
        </div>

        {/* Account Aggregator Consent */}
        <button
          className="setting-row"
          onClick={() => setConsentModalOpen(true)}
        >
          <div className="setting-label-icon">
            <ShieldCheck size={18} className="teal" />
            <div>
              <strong>Data Permissions & Consent</strong>
              <small>Manage Account Aggregator connectivity</small>
            </div>
          </div>
          <span>
            Active <ChevronRight size={17} />
          </span>
        </button>

        {/* Voice Responses Toggle */}
        <div className="setting-row">
          <div className="setting-label-icon">
            <Smartphone size={18} className="teal" />
            <div>
              <strong>Voice & Audio Prompts</strong>
              <small>Enable spoken vernacular playback for commitments</small>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={toggleVoice}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        {/* Biometric 2FA */}
        <div className="setting-row">
          <div className="setting-label-icon">
            <LockKeyhole size={18} className="teal" />
            <div>
              <strong>Biometric Security (Face ID / UPI PIN)</strong>
              <small>Mandatory for loan confirmations and transfers</small>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={biometricsEnabled}
              onChange={toggleBiometrics}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        {/* Logout */}
        <button className="setting-row logout-row" onClick={handleLogout}>
          <div className="setting-label-icon">
            <LogOut size={18} className="coral" />
            <div>
              <strong className="coral">Log Out / End Session</strong>
              <small>Return to landing page</small>
            </div>
          </div>
          <span>
            <ChevronRight size={17} />
          </span>
        </button>
      </div>

      <p className="settings-foot">
        <LockKeyhole size={14} /> Vani-Fi is built with consent, clarity, and your control at the centre.
      </p>

      <ConsentManagerModal
        isOpen={consentModalOpen}
        onClose={() => setConsentModalOpen(false)}
      />
    </>
  )
}
