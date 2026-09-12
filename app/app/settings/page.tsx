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
import { ReportIssueModal } from '@/components/modals/report-issue-modal'

export default function SettingsPage() {
  const router = useRouter()
  const {
    language,
    setLanguage,
    stressLevel,
    setStressLevel,
    showToast,
    consent,
    updateConsent,
    t,
    profile,
    updateProfile,
  } = useFinancial()

  const [consentModalOpen, setConsentModalOpen] = useState(false)
  const voiceEnabled = consent.voice
  const [biometricsEnabled, setBiometricsEnabled] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileDraft, setProfileDraft] = useState(profile)
  const [supportOpen, setSupportOpen] = useState(false)

  const toggleVoice = () => {
    updateConsent({ voice: !voiceEnabled })
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
          <span className="soft-label">{t('profile')}</span>
          <h2>{profile.name}</h2>
          <p>{profile.email} · {profile.phone}</p>
          {editingProfile ? (
            <form className="settings-profile-edit" onSubmit={e => { e.preventDefault(); updateProfile(profileDraft); setEditingProfile(false) }}>
              <label className="field-label" htmlFor="profile-name">Name</label>
              <input id="profile-name" className="entry-input" value={profileDraft.name} onChange={e => setProfileDraft({ ...profileDraft, name: e.target.value })} required />
              <label className="field-label" htmlFor="profile-email">Email</label>
              <input id="profile-email" className="entry-input" type="email" value={profileDraft.email} onChange={e => setProfileDraft({ ...profileDraft, email: e.target.value })} required />
              <div className="modal-actions"><button type="button" className="ghost-button" onClick={() => { setProfileDraft(profile); setEditingProfile(false) }}>Cancel</button><button type="submit" className="button teal-button">Save profile</button></div>
            </form>
          ) : (
            <button className="ghost-button" onClick={() => setEditingProfile(true)}>Edit profile</button>
          )}
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
                <strong>{t('preferredLanguage')}</strong>
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
                <strong>{t('demoMode')}</strong>
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
              <strong>{t('dataPermissions')}</strong>
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
                <strong>{t('voiceAudio')}</strong>
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
                <strong>{t('biometricSecurity')} (Face ID / UPI PIN)</strong>
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

      <div className="settings-support-row">
        <div><strong>Help & support</strong><small>Open a demo support case with the security desk.</small></div>
        <button className="ghost-button" onClick={() => setSupportOpen(true)}>Contact support</button>
      </div>

      <ConsentManagerModal
        isOpen={consentModalOpen}
        onClose={() => setConsentModalOpen(false)}
      />
      <ReportIssueModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  )
}
