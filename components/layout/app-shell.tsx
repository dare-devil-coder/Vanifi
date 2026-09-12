'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Zap,
  Wallet,
  Sparkles,
  ShieldCheck,
  Mic,
  CircleHelp,
  LockKeyhole,
  Menu,
  Bell,
  MoreHorizontal,
  Landmark,
  Check,
  Percent,
} from 'lucide-react'
import { useFinancial } from '@/lib/financial-context'
import { VoiceAssistantDock } from '@/components/voice/voice-assistant-dock'
import { ConsentManagerModal } from '@/components/modals/consent-manager-modal'
import { ReportIssueModal } from '@/components/modals/report-issue-modal'

function CalendarIcon({ size = 18, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

const navItems = [
  { href: '/app', label: 'Overview', icon: Home, id: 'overview' },
  { href: '/app/financial-pulse', label: 'Financial pulse', icon: Zap, id: 'pulse' },
  { href: '/app/money', label: 'Money', icon: Wallet, id: 'money' },
  { href: '/app/commitments', label: 'Commitments', icon: CalendarIcon, id: 'commitments' },
  { href: '/app/for-you', label: 'For you', icon: Sparkles, id: 'foryou', badge: '2' },
  { href: '/app/protection', label: 'Protection', icon: ShieldCheck, id: 'protection' },
  { href: '/app/loans', label: 'Borrowing & KFS', icon: Percent, id: 'loans' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const {
    language,
    setLanguage,
    unreadCount,
    toastMessage,
    t,
  } = useFinancial()

  const [mobileNav, setMobileNav] = useState(false)
  const [consentOpen, setConsentOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    const handleDialogKeyboard = (event: KeyboardEvent) => {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]')
      if (!dialog) return
      if (event.key === 'Escape') {
        const closeButton = dialog.querySelector<HTMLButtonElement>('button[aria-label*="Close"], button[aria-label*="close"]')
        if (closeButton) closeButton.click()
        else dialog.querySelector<HTMLElement>('.modal-overlay')?.click()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(element => !element.hasAttribute('disabled'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleDialogKeyboard)
    return () => document.removeEventListener('keydown', handleDialogKeyboard)
  }, [])

  const cycleLanguage = () => {
    if (language === 'English') setLanguage('हिन्दी')
    else if (language === 'हिन्दी') setLanguage('ગુજરાતી')
    else setLanguage('English')
  }

  const localizedNavItems = navItems.map(item => ({
    ...item,
    label: t(item.id === 'foryou' ? 'forYou' : item.id as keyof typeof import('@/lib/translations').translations['English']),
  }))

  // Determine current page title
  const getTitle = () => {
    if (pathname === '/app') return `${t('welcomeBack')}, Riya`
    if (pathname === '/app/financial-pulse') return t('pulse')
    if (pathname === '/app/money') return t('money')
    if (pathname === '/app/commitments') return t('commitments')
    if (pathname === '/app/for-you') return t('forYou')
    if (pathname === '/app/protection') return t('protection')
    if (pathname === '/app/assistant') return t('assistant')
    if (pathname?.startsWith('/app/loans')) return t('loans')
    if (pathname === '/app/notifications') return t('notifications')
    if (pathname === '/app/settings') return t('settings')
    return 'Vani-Fi'
  }

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <Link href="/" className="brand">
          <span className="brand-mark">V</span>
          <span>VANI-FI</span>
          <small>Financial intelligence for Bharat</small>
        </Link>

        <div className="profile">
          <div className="avatar">RS</div>
          <div>
            <strong>Riya Sharma</strong>
            <span>Personal account</span>
          </div>
          <button
            onClick={() => router.push('/app/settings')}
            className="icon-mini-btn"
            aria-label="User settings"
          >
            <MoreHorizontal size={17} />
          </button>
        </div>

        <nav aria-label="Main navigation">
          {localizedNavItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileNav(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && <b>{item.badge}</b>}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <Link
            href="/app/assistant"
            className={`nav-item ${pathname === '/app/assistant' ? 'active' : ''}`}
            onClick={() => setMobileNav(false)}
          >
            <Mic size={18} />
            <span>Ask Vani</span>
          </Link>
          <Link
            href="/app/settings"
            className={`nav-item ${pathname === '/app/settings' ? 'active' : ''}`}
            onClick={() => setMobileNav(false)}
          >
            <CircleHelp size={18} />
            <span>Help & settings</span>
          </Link>
          <button
            type="button"
            className="consent-trigger-button"
            onClick={() => setConsentOpen(true)}
          >
            <LockKeyhole size={14} />
            <span>Your data stays yours</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileNav(!mobileNav)}
            aria-label="Toggle navigation menu"
          >
            <Menu size={21} />
          </button>

          <div>
            <p className="eyebrow">
              {pathname === '/app' ? 'Tuesday, 12 September 2026' : 'VANI-FI / SMART COPILOT'}
            </p>
            <h1>{getTitle()}</h1>
          </div>

          <div className="top-actions">
            <Link
              href="/app/notifications"
              className="icon-button"
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <Bell size={19} />
              {unreadCount > 0 && <i>{unreadCount}</i>}
            </Link>
            <button
              className="language"
              onClick={cycleLanguage}
              title="Click to switch between English, Hindi, and Gujarati"
            >
              {language}
            </button>
          </div>
        </header>

        <div className="content-wrap">
          {children}
        </div>
      </main>

      {/* Global Floating Voice Assistant */}
      <VoiceAssistantDock />

      {/* Global Modals */}
      <ConsentManagerModal isOpen={consentOpen} onClose={() => setConsentOpen(false)} />
      <ReportIssueModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />

      {/* Real Toast Notification */}
      {toastMessage && (
        <div className="toast" role="status">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
