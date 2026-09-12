'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { Language, translations } from './translations'

export interface Commitment {
  id: string
  title: string
  dueDate: string
  amount: number
  savedAmount: number
  category: 'Education' | 'Housing' | 'Insurance' | 'Bills' | 'Family'
  priority: 'High priority' | 'Recurring' | 'Protected'
  status: 'confirmed' | 'virtual'
  isRecurring?: boolean
  notes?: string
}

export interface Transaction {
  id: string
  title: string
  category: string
  amount: number
  date: string
  type: 'income' | 'expense'
}

export interface NotificationItem {
  id: string
  title: string
  text: string
  time: string
  read: boolean
  category: 'system' | 'savings' | 'commitment' | 'security'
  link?: string
}

export type RecommendationType = 'OFFER' | 'ASSIST' | 'PROTECT' | 'WARN' | 'DO_NOTHING'

export interface Recommendation {
  id: string
  type: RecommendationType
  badge: string
  title: string
  description: string
  actionLabel?: string
  actionRoute?: string
  actionType?: 'navigate' | 'modal' | 'none'
  reasoning: string
}

export interface FraudAlert {
  id: string
  merchant: string
  amount: number
  time: string
  status: 'pending' | 'verified' | 'blocked'
  reason: string
  location: string
}

export type VoiceState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'UNDERSTANDING'
  | 'CONFIRMATION_REQUIRED'
  | 'USER_CONFIRMED'
  | 'ACTION'
  | 'COMPLETE'
  | 'ERROR'

export interface VoicePayload {
  intent: 'create_commitment' | 'check_safe_to_spend' | 'loan_affordability' | 'general'
  rawText: string
  category?: string
  amount?: number
  dueDate?: string
  priority?: 'High priority' | 'Recurring' | 'Protected'
  spokenConfirmation?: string
}

export interface LoanApplicationData {
  id: string
  amount: number
  tenureMonths: number
  interestRate: number
  emi: number
  totalRepayment: number
  processingFee: number
  status: 'submitted' | 'under_review' | 'approved'
  date: string
  purpose: string
}

interface FinancialContextType {
  // Balance & Financial Pulse
  currentBalance: number
  safeToSpend: number
  expectedIncome: number
  totalUpcomingCommitments: number
  pulseScore: number
  pulseMomentum: string
  metrics: {
    liquidity: { value: string; detail: string; tone: 'teal' | 'amber' | 'coral' }
    incomeStability: { value: string; detail: string; tone: 'teal' | 'amber' | 'coral' }
    debtLoad: { value: string; detail: string; tone: 'teal' | 'amber' | 'coral' }
    protection: { value: string; detail: string; tone: 'teal' | 'amber' | 'coral' }
  }

  // Commitments
  commitments: Commitment[]
  addCommitment: (c: Omit<Commitment, 'id' | 'savedAmount' | 'status'>) => Commitment
  updateCommitment: (id: string, updates: Partial<Commitment>) => void
  deleteCommitment: (id: string) => void
  setAsideForCommitment: (id: string, amount: number) => void

  // Transactions & Accounts
  transactions: Transaction[]
  addMoney: (amount: number, source: string) => void
  transferMoney: (amount: number, recipient: string, note: string) => boolean

  // Responsible AI / Stressed toggle
  stressLevel: 'healthy' | 'stressed'
  setStressLevel: (level: 'healthy' | 'stressed') => void
  recommendations: Recommendation[]

  // Fraud & Security
  fraudAlerts: FraudAlert[]
  resolveFraudAlert: (id: string, action: 'verified' | 'blocked') => void

  // Loan Flow
  loanApplications: LoanApplicationData[]
  submitLoanApplication: (data: Omit<LoanApplicationData, 'id' | 'status' | 'date'>) => LoanApplicationData

  // Notifications
  notifications: NotificationItem[]
  unreadCount: number
  markAllNotificationsRead: () => void
  markNotificationRead: (id: string) => void
  addNotification: (title: string, text: string, category?: NotificationItem['category'], link?: string) => void

  // Language & i18n
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof typeof translations['English']) => string

  // Voice Assistant state machine
  voiceState: VoiceState
  voicePayload: VoicePayload | null
  startVoiceListening: () => void
  simulateVoiceInput: (samplePrompt: string) => void
  confirmVoiceAction: () => void
  cancelVoiceAction: () => void
  setVoiceState: (state: VoiceState) => void

  // Toast / System notifications
  toastMessage: string | null
  showToast: (msg: string) => void
}

const FinancialContext = createContext<FinancialContextType | null>(null)

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  // Core financial state
  const [currentBalance, setCurrentBalance] = useState<number>(124580.5)
  const [expectedIncome] = useState<number>(78500)
  const [language, setLanguageState] = useState<Language>('English')
  const [stressLevel, setStressLevel] = useState<'healthy' | 'stressed'>('healthy')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Commitments with initial realistic data
  const [commitments, setCommitments] = useState<Commitment[]>([
    {
      id: 'comm-1',
      title: 'College fees',
      dueDate: '18 Oct',
      amount: 50000,
      savedAmount: 34000,
      category: 'Education',
      priority: 'High priority',
      status: 'confirmed',
      notes: 'Semester fee for engineering course',
    },
    {
      id: 'comm-2',
      title: 'Apartment rent',
      dueDate: '01 Oct',
      amount: 18000,
      savedAmount: 18000,
      category: 'Housing',
      priority: 'Recurring',
      status: 'confirmed',
      isRecurring: true,
      notes: 'Monthly rent for Mumbai apartment',
    },
    {
      id: 'comm-3',
      title: 'Term insurance premium',
      dueDate: '12 Nov',
      amount: 7850,
      savedAmount: 0,
      category: 'Insurance',
      priority: 'Protected',
      status: 'confirmed',
      notes: 'Annual policy renewal',
    },
  ])

  // Transactions list
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'tx-1', title: 'Swiggy', category: 'Food & dining', amount: -420, date: 'Today', type: 'expense' },
    { id: 'tx-2', title: 'Salary credit', category: 'Income', amount: 78500, date: 'Yesterday', type: 'income' },
    { id: 'tx-3', title: 'Airtel payment', category: 'Bills', amount: -799, date: '12 Sep', type: 'expense' },
    { id: 'tx-4', title: 'DMart Grocery', category: 'Shopping', amount: -2450, date: '10 Sep', type: 'expense' },
    { id: 'tx-5', title: 'UPI Transfer from Amit', category: 'Income', amount: 3500, date: '08 Sep', type: 'income' },
  ])

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Savings rhythm is improving',
      text: 'You are 12% ahead of your usual pace this month.',
      time: '2 hours ago',
      read: false,
      category: 'savings',
      link: '/app/financial-pulse',
    },
    {
      id: 'notif-2',
      title: 'College fees coming up',
      text: '₹50,000 is due in 36 days. You have set aside ₹34,000.',
      time: 'Yesterday',
      read: false,
      category: 'commitment',
      link: '/app/commitments',
    },
    {
      id: 'notif-3',
      title: 'New device verified',
      text: 'Your iPhone sign-in from Mumbai was verified successfully.',
      time: '2 days ago',
      read: true,
      category: 'security',
      link: '/app/protection',
    },
  ])

  // Fraud / Security Alerts
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([
    {
      id: 'fa-1',
      merchant: 'Unknown Cloud Gaming Ltd',
      amount: 4899,
      time: 'Today, 2:14 AM',
      status: 'pending',
      reason: 'Unusual midnight international transaction on virtual card',
      location: 'London, UK (IP Mismatch)',
    },
  ])

  // Loan Applications
  const [loanApplications, setLoanApplications] = useState<LoanApplicationData[]>([])

  // Voice Assistant state machine
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE')
  const [voicePayload, setVoicePayload] = useState<VoicePayload | null>(null)

  // Safe-to-Spend is dynamically calculated from balance minus unreserved commitments
  // Concept: Safe-to-Spend = Current Balance - Sum of (Commitment Amount - Saved Amount)
  const totalUpcomingCommitments = useMemo(() => {
    return commitments.reduce((sum, c) => sum + c.amount, 0)
  }, [commitments])

  const unreservedCommitments = useMemo(() => {
    return commitments.reduce((sum, c) => sum + Math.max(0, c.amount - c.savedAmount), 0)
  }, [commitments])

  const safeToSpend = useMemo(() => {
    // Retain minimum safety buffer of ₹10,000 if balance permits
    const buffer = 10000
    const available = currentBalance - unreservedCommitments - buffer
    return Math.max(0, Math.round(available > 0 ? available : currentBalance - unreservedCommitments))
  }, [currentBalance, unreservedCommitments])

  // Financial Pulse dynamically updates with stress mode
  const pulseScore = stressLevel === 'healthy' ? 82 : 48
  const pulseMomentum = stressLevel === 'healthy' ? 'Good financial momentum' : 'Financial stress detected'

  const metrics = useMemo(() => {
    if (stressLevel === 'healthy') {
      return {
        liquidity: { value: 'Strong', detail: 'Covering 2.4 months of planned expenses', tone: 'teal' as const },
        incomeStability: { value: 'Stable', detail: 'Consistent for 4 consecutive months', tone: 'teal' as const },
        debtLoad: { value: 'Moderate', detail: '24% of monthly income allocated to EMIs', tone: 'amber' as const },
        protection: { value: 'Good', detail: 'Term cover in place, card fraud filter active', tone: 'teal' as const },
      }
    } else {
      return {
        liquidity: { value: 'Low', detail: 'Buffer under 15 days of upcoming commitments', tone: 'coral' as const },
        incomeStability: { value: 'Declining', detail: 'Variable inflow noticed this cycle', tone: 'coral' as const },
        debtLoad: { value: 'High', detail: '46% of monthly income under obligations', tone: 'coral' as const },
        protection: { value: 'Attention', detail: 'Upcoming insurance renewal pending', tone: 'amber' as const },
      }
    }
  }, [stressLevel])

  // Recommendations: context-sensitive (OFFER, ASSIST, PROTECT, WARN, DO_NOTHING)
  const recommendations = useMemo((): Recommendation[] => {
    if (stressLevel === 'healthy') {
      return [
        {
          id: 'rec-1',
          type: 'OFFER',
          badge: 'BEST NEXT STEP',
          title: 'Build your emergency buffer',
          description: 'You are ₹25,000 away from a comfortable 3-month cushion. Setting aside ₹2,500 weekly achieves this by March.',
          actionLabel: 'Set aside buffer',
          actionRoute: '/app/commitments',
          actionType: 'navigate',
          reasoning: 'Your income is stable and 68% of known commitments are already pre-funded. This is the optimal window to lock in liquidity.',
        },
        {
          id: 'rec-2',
          type: 'PROTECT',
          badge: 'FRAUD SHIELD',
          title: 'Review online transaction limit',
          description: 'Lock your virtual card to ₹15,000 to prevent unauthorized high-ticket e-commerce debits.',
          actionLabel: 'Go to Protection',
          actionRoute: '/app/protection',
          actionType: 'navigate',
          reasoning: 'An unverified international merchant ping was flagged recently. Restricting limits protects your main HDFC account.',
        },
        {
          id: 'rec-3',
          type: 'DO_NOTHING',
          badge: 'RESPONSIBLE AI',
          title: 'No credit products recommended',
          description: 'You currently have sufficient liquidity for your planned commitments. Taking unnecessary loans or BNPL would add friction.',
          reasoning: 'Vani-Fi strictly suppresses loan and credit offers when your current cashflow is healthy and does not require borrowing.',
        },
      ]
    } else {
      return [
        {
          id: 'rec-stress-1',
          type: 'ASSIST',
          badge: 'ASSISTANCE REQUIRED',
          title: 'Restructure upcoming college fees schedule',
          description: 'Rather than taking an emergency personal loan at 16%, split the ₹50,000 fee into 2 instalments with college zero-cost support.',
          actionLabel: 'Review options',
          actionRoute: '/app/loans',
          actionType: 'navigate',
          reasoning: 'Upcoming commitments will deplete your safe-to-spend balance in 14 days. Immediate cash preservation is advised.',
        },
        {
          id: 'rec-stress-2',
          type: 'WARN',
          badge: 'CAUTION: OVER-LEVERAGING',
          title: 'Pause discretionary spending and new credit',
          description: 'Debt obligations already consume 46% of your monthly cash flow. New credit card applications should be avoided.',
          actionLabel: 'View Commitments',
          actionRoute: '/app/commitments',
          actionType: 'navigate',
          reasoning: 'Taking new loans under financial stress leads to debt spirals. Vani-Fi prioritizes your long-term security.',
        },
        {
          id: 'rec-stress-3',
          type: 'DO_NOTHING',
          badge: 'ETHICAL GUARDRAIL',
          title: 'Loan sales suppressed by Vani-Fi guardrail',
          description: 'Commercial loan offers are disabled for this account because debt load is high. We will help you navigate current bills first.',
          reasoning: 'Our non-predatory commitment ensures we never sell credit to customers showing active financial distress signals.',
        },
      ]
    }
  }, [stressLevel])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    window.setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  const addNotification = (title: string, text: string, category: NotificationItem['category'] = 'system', link?: string) => {
    const newItem: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      text,
      time: 'Just now',
      read: false,
      category,
      link,
    }
    setNotifications(prev => [newItem, ...prev])
  }

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    showToast('All notifications marked as read')
  }

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length
  }, [notifications])

  // Real Commitment CRUD operations
  const addCommitment = (c: Omit<Commitment, 'id' | 'savedAmount' | 'status'>) => {
    const newCommitment: Commitment = {
      ...c,
      id: `comm-${Date.now()}`,
      savedAmount: 0,
      status: 'confirmed',
    }
    setCommitments(prev => [newCommitment, ...prev])
    addNotification(`New commitment added: ${c.title}`, `₹${c.amount.toLocaleString('en-IN')} reserved for ${c.dueDate}`, 'commitment', '/app/commitments')
    showToast(`Added "${c.title}" commitment of ₹${c.amount.toLocaleString('en-IN')}`)
    return newCommitment
  }

  const updateCommitment = (id: string, updates: Partial<Commitment>) => {
    setCommitments(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updates }
          return updated
        }
        return item
      })
    )
    addNotification('Commitment updated', 'Your planned expenses and safe-to-spend balance were adjusted.', 'commitment', '/app/commitments')
    showToast('Commitment updated successfully')
  }

  const deleteCommitment = (id: string) => {
    const target = commitments.find(c => c.id === id)
    setCommitments(prev => prev.filter(c => c.id !== id))
    addNotification('Commitment removed', `Removed ${target?.title || 'item'}. Safe-to-Spend has been restored.`, 'commitment', '/app/commitments')
    showToast(`Removed commitment "${target?.title || 'item'}"`)
  }

  const setAsideForCommitment = (id: string, amount: number) => {
    setCommitments(prev =>
      prev.map(c => {
        if (c.id === id) {
          const newSaved = Math.min(c.amount, c.savedAmount + amount)
          return { ...c, savedAmount: newSaved }
        }
        return c
      })
    )
    const target = commitments.find(c => c.id === id)
    addNotification(`Funds earmarked for ${target?.title || 'Commitment'}`, `Virtual allocation of ₹${amount.toLocaleString('en-IN')} updated.`, 'savings', '/app/commitments')
    showToast(`Allocated ₹${amount.toLocaleString('en-IN')} to ${target?.title || 'commitment'}`)
  }

  // Real Account & Money Operations
  const addMoney = (amount: number, source: string) => {
    if (amount <= 0) return
    setCurrentBalance(prev => prev + amount)
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: `Deposit via ${source}`,
      category: 'Deposit',
      amount: amount,
      date: 'Just now',
      type: 'income',
    }
    setTransactions(prev => [newTx, ...prev])
    addNotification('Funds credited', `₹${amount.toLocaleString('en-IN')} added from ${source}. Safe-to-Spend increased.`, 'system', '/app/money')
    showToast(`₹${amount.toLocaleString('en-IN')} added successfully`)
  }

  const transferMoney = (amount: number, recipient: string, note: string) => {
    if (amount <= 0 || amount > currentBalance) {
      showToast('Insufficient funds for transfer')
      return false
    }
    setCurrentBalance(prev => prev - amount)
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: `Transfer to ${recipient}`,
      category: note || 'Transfer',
      amount: -amount,
      date: 'Just now',
      type: 'expense',
    }
    setTransactions(prev => [newTx, ...prev])
    addNotification('Transfer completed', `Sent ₹${amount.toLocaleString('en-IN')} to ${recipient}.`, 'system', '/app/money')
    showToast(`Sent ₹${amount.toLocaleString('en-IN')} to ${recipient}`)
    return true
  }

  // Fraud / Security resolution
  const resolveFraudAlert = (id: string, action: 'verified' | 'blocked') => {
    setFraudAlerts(prev =>
      prev.map(a => {
        if (a.id === id) {
          return { ...a, status: action }
        }
        return a
      })
    )
    if (action === 'blocked') {
      showToast('Merchant blocked & virtual card temporarily locked for safety.')
      addNotification('Security Alert Resolved', 'Merchant was blocked and reported.', 'security', '/app/protection')
    } else {
      showToast('Transaction verified and marked safe.')
      addNotification('Security Cleared', 'Transaction verified by account owner.', 'security', '/app/protection')
    }
  }

  // Transparent Loan Application
  const submitLoanApplication = (data: Omit<LoanApplicationData, 'id' | 'status' | 'date'>) => {
    const app: LoanApplicationData = {
      ...data,
      id: `loan-${Date.now()}`,
      status: 'submitted',
      date: '12 Sep 2026',
    }
    setLoanApplications(prev => [app, ...prev])
    addNotification('Loan Application Registered', `Key Facts Statement generated for ₹${data.amount.toLocaleString('en-IN')}. Under cool-off period review.`, 'system', '/app/loans')
    showToast(`Loan application of ₹${data.amount.toLocaleString('en-IN')} submitted securely!`)
    return app
  }

  // Voice Assistant simulation & intent execution
  const startVoiceListening = () => {
    setVoiceState('LISTENING')
    setVoicePayload(null)
  }

  const simulateVoiceInput = (samplePrompt: string) => {
    setVoiceState('PROCESSING')

    // Simulate realistic speech processing delay
    setTimeout(() => {
      setVoiceState('UNDERSTANDING')

      setTimeout(() => {
        if (samplePrompt.toLowerCase().includes('college') || samplePrompt.toLowerCase().includes('fees') || samplePrompt.includes('फीस')) {
          setVoicePayload({
            intent: 'create_commitment',
            rawText: samplePrompt,
            category: 'Education',
            amount: 50000,
            dueDate: '18 Oct 2026',
            priority: 'High priority',
            spokenConfirmation: 'आपकी बेटी की कॉलेज फीस ₹50,000 की 18 अक्टूबर के लिए पहचान ली गई है। क्या मैं इसे एक आगामी जिम्मेदारी के रूप में सुरक्षित कर दूं?',
          })
          setVoiceState('CONFIRMATION_REQUIRED')
        } else if (samplePrompt.toLowerCase().includes('rent') || samplePrompt.includes('किराया')) {
          setVoicePayload({
            intent: 'create_commitment',
            rawText: samplePrompt,
            category: 'Housing',
            amount: 18000,
            dueDate: '01 Nov 2026',
            priority: 'Recurring',
            spokenConfirmation: 'I identified an upcoming apartment rent commitment of ₹18,000 for 1st November. Shall I reserve this in your safe-to-spend plan?',
          })
          setVoiceState('CONFIRMATION_REQUIRED')
        } else if (samplePrompt.toLowerCase().includes('safe') || samplePrompt.includes('spend') || samplePrompt.includes('खर्च')) {
          setVoicePayload({
            intent: 'check_safe_to_spend',
            rawText: samplePrompt,
            spokenConfirmation: `आपके सभी खर्चों और सुरक्षित बफर को अलग रखने के बाद, आपकी सुरक्षित खर्च सीमा ₹${safeToSpend.toLocaleString('en-IN')} है।`,
          })
          setVoiceState('COMPLETE')
        } else {
          setVoicePayload({
            intent: 'general',
            rawText: samplePrompt,
            spokenConfirmation: 'मैंने आपकी बात समझ ली है। आपका वित्तीय बफर और सभी योजनाएं पूरी तरह सुरक्षित हैं।',
          })
          setVoiceState('COMPLETE')
        }
      }, 700)
    }, 600)
  }

  const confirmVoiceAction = () => {
    if (!voicePayload) return
    setVoiceState('ACTION')

    setTimeout(() => {
      if (voicePayload.intent === 'create_commitment' && voicePayload.amount) {
        addCommitment({
          title: voicePayload.category === 'Education' ? 'College fee (Voice created)' : 'Rent commitment (Voice created)',
          dueDate: voicePayload.dueDate || 'Next month',
          amount: voicePayload.amount,
          category: (voicePayload.category as any) || 'Family',
          priority: voicePayload.priority || 'High priority',
          notes: `Created via vernacular voice: "${voicePayload.rawText}"`,
        })
      }
      setVoiceState('COMPLETE')
      showToast('Voice commitment confirmed and added to your financial plan!')
    }, 500)
  }

  const cancelVoiceAction = () => {
    setVoiceState('IDLE')
    setVoicePayload(null)
  }

  // Language translation helper
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    showToast(`Language set to ${lang}`)
  }

  const t = (key: keyof typeof translations['English']): string => {
    return translations[language]?.[key] || translations['English'][key] || (key as string)
  }

  return (
    <FinancialContext.Provider
      value={{
        currentBalance,
        safeToSpend,
        expectedIncome,
        totalUpcomingCommitments,
        pulseScore,
        pulseMomentum,
        metrics,
        commitments,
        addCommitment,
        updateCommitment,
        deleteCommitment,
        setAsideForCommitment,
        transactions,
        addMoney,
        transferMoney,
        stressLevel,
        setStressLevel,
        recommendations,
        fraudAlerts,
        resolveFraudAlert,
        loanApplications,
        submitLoanApplication,
        notifications,
        unreadCount,
        markAllNotificationsRead,
        markNotificationRead,
        addNotification,
        language,
        setLanguage,
        t,
        voiceState,
        voicePayload,
        startVoiceListening,
        simulateVoiceInput,
        confirmVoiceAction,
        cancelVoiceAction,
        setVoiceState,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </FinancialContext.Provider>
  )
}

export function useFinancial() {
  const context = useContext(FinancialContext)
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider')
  }
  return context
}
