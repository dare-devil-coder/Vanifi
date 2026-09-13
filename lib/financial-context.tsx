'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react'
import { Language, translations } from './translations'
import { calculateFinancialPulse, calculateSafeToSpend, getNextBestActions, parseVoiceIntent } from './financial/calculations'

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

export interface ConsentState {
  accountAggregation: boolean
  personalization: boolean
  notifications: boolean
  voice: boolean
  analytics: boolean
}

export interface UserProfile {
  name: string
  email: string
  phone: string
}

export type VoiceState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'UNDERSTANDING'
  | 'CLARIFICATION_REQUIRED'
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
  missingFields?: Array<'amount' | 'dueDate'>
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
  pulseBand: 'excellent' | 'healthy' | 'watch' | 'stressed' | 'critical'
  pulseMomentum: string
  pulseDrivers: string[]
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
  consent: ConsentState
  updateConsent: (updates: Partial<ConsentState>) => void
  profile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void

  // Voice Assistant state machine
  voiceState: VoiceState
  voicePayload: VoicePayload | null
  startVoiceListening: () => void
  stopVoiceListening: () => void
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
  const [consent, setConsent] = useState<ConsentState>({
    accountAggregation: true,
    personalization: true,
    notifications: true,
    voice: true,
    analytics: false,
  })
  const [isHydrated, setIsHydrated] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Riya Sharma',
    email: 'riya.sharma@email.com',
    phone: '+91 98765 43210',
  })

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

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('vani-fi-demo-state')
      if (saved) {
        const state = JSON.parse(saved) as Partial<{
          currentBalance: number
          commitments: Commitment[]
          transactions: Transaction[]
          notifications: NotificationItem[]
          fraudAlerts: FraudAlert[]
          loanApplications: LoanApplicationData[]
          language: Language
          stressLevel: 'healthy' | 'stressed'
          consent: ConsentState
          profile: UserProfile
        }>
        if (typeof state.currentBalance === 'number') setCurrentBalance(state.currentBalance)
        if (state.commitments) setCommitments(state.commitments)
        if (state.transactions) setTransactions(state.transactions)
        if (state.notifications) setNotifications(state.notifications)
        if (state.fraudAlerts) setFraudAlerts(state.fraudAlerts)
        if (state.loanApplications) setLoanApplications(state.loanApplications)
        if (state.language) setLanguageState(state.language)
        if (state.stressLevel) setStressLevel(state.stressLevel)
        if (state.consent) setConsent(state.consent)
        if (state.profile) setProfile(state.profile)
      }
    } catch {
      window.localStorage.removeItem('vani-fi-demo-state')
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    window.localStorage.setItem('vani-fi-demo-state', JSON.stringify({
      currentBalance,
      commitments,
      transactions,
      notifications,
      fraudAlerts,
      loanApplications,
      language,
      stressLevel,
      consent,
      profile,
    }))
  }, [isHydrated, currentBalance, commitments, transactions, notifications, fraudAlerts, loanApplications, language, stressLevel, consent, profile])

  // Safe-to-Spend is dynamically calculated from balance minus unreserved commitments
  // Concept: Safe-to-Spend = Current Balance - Sum of (Commitment Amount - Saved Amount)
  const totalUpcomingCommitments = useMemo(() => {
    return commitments.reduce((sum, c) => sum + c.amount, 0)
  }, [commitments])

  const safeToSpend = useMemo(() => {
    return calculateSafeToSpend({
      currentBalance,
      commitments: commitments.map(commitment => ({
        ...commitment,
        confidence: 'CONFIRMED' as const,
      })),
      safetyBuffer: 10000,
    })
  }, [currentBalance, commitments])

  const pulseMetrics = useMemo(() => calculateFinancialPulse({
    currentBalance,
    monthlyIncome: expectedIncome,
    commitments: commitments.map(commitment => ({
      ...commitment,
      confidence: commitment.priority === 'Recurring' ? 'RECURRING' as const : 'CONFIRMED' as const,
    })),
    safeToSpend,
    transactions,
    pendingFraud: fraudAlerts.some(alert => alert.status === 'pending'),
    stressOverride: stressLevel === 'stressed' ? 'stressed' : undefined,
  }), [currentBalance, expectedIncome, commitments, safeToSpend, transactions, fraudAlerts, stressLevel])

  const pulseScore = pulseMetrics.score
  const pulseMomentum = pulseMetrics.momentum

  const metrics = useMemo(() => {
    const toneFor = (value: string) => value === 'strong' || value === 'stable' || value === 'low' || value === 'covered' ? 'teal' as const : value === 'moderate' || value === 'review' || value === 'variable' ? 'amber' as const : 'coral' as const
    return {
      liquidity: { value: pulseMetrics.liquidity[0].toUpperCase() + pulseMetrics.liquidity.slice(1), detail: `Safe-to-Spend is ₹${safeToSpend.toLocaleString('en-IN')} of ₹${currentBalance.toLocaleString('en-IN')} liquid balance`, tone: toneFor(pulseMetrics.liquidity) },
      incomeStability: { value: pulseMetrics.incomeStability[0].toUpperCase() + pulseMetrics.incomeStability.slice(1), detail: `Expected monthly income: ₹${expectedIncome.toLocaleString('en-IN')}`, tone: toneFor(pulseMetrics.incomeStability) },
      debtLoad: { value: pulseMetrics.debtLoad[0].toUpperCase() + pulseMetrics.debtLoad.slice(1), detail: `${commitments.length} upcoming commitment${commitments.length === 1 ? '' : 's'} tracked`, tone: toneFor(pulseMetrics.debtLoad) },
      protection: { value: pulseMetrics.protectionStatus === 'covered' ? 'Good' : 'Review', detail: fraudAlerts.some(alert => alert.status === 'pending') ? 'Unusual activity needs review' : 'No unresolved security alerts', tone: toneFor(pulseMetrics.protectionStatus) },
    }
  }, [pulseMetrics, safeToSpend, currentBalance, expectedIncome, commitments.length, fraudAlerts])

  // Recommendations: context-sensitive (OFFER, ASSIST, PROTECT, WARN, DO_NOTHING)
  const recommendations = useMemo(() => getNextBestActions({
    pulse: pulseMetrics,
    safeToSpend,
    stressLevel,
    currentBalance,
    commitments: commitments.map(commitment => ({
      ...commitment,
      confidence: commitment.priority === 'Recurring' ? 'RECURRING' as const : 'CONFIRMED' as const,
    })),
    pendingFraud: fraudAlerts.some(alert => alert.status === 'pending'),
  }).map(({ priority: _priority, ...recommendation }) => recommendation), [pulseMetrics, safeToSpend, stressLevel, currentBalance, commitments, fraudAlerts])

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

  // Voice Assistant: Real Web Speech API with continuous listening and simulation fallback
  const dockRecognitionRef = useRef<any>(null)
  const dockTranscriptRef = useRef<string>('')
  const dockPersistedTranscriptRef = useRef<string>('')
  const isDockListeningRef = useRef<boolean>(false)

  const stopVoiceListening = () => {
    isDockListeningRef.current = false
    if (dockRecognitionRef.current) {
      try {
        dockRecognitionRef.current.stop()
      } catch (e) {}
    }
    const textToProcess = dockTranscriptRef.current.trim()
    if (textToProcess) {
      simulateVoiceInput(textToProcess)
    } else {
      setVoiceState('IDLE')
      showToast('No voice input detected.')
    }
  }

  const startVoiceListening = () => {
    setVoiceState('LISTENING')
    setVoicePayload(null)
    dockTranscriptRef.current = ''
    dockPersistedTranscriptRef.current = ''

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      try {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        const recognition = new SpeechRec()
        dockRecognitionRef.current = recognition
        recognition.lang = language === 'ગુજરાતી' ? 'gu-IN' : language === 'हिन्दी' ? 'hi-IN' : 'en-IN'
        recognition.continuous = true
        recognition.interimResults = true
        isDockListeningRef.current = true

        recognition.onstart = () => {
          setVoiceState('LISTENING')
        }

        recognition.onresult = (event: any) => {
          let sessionText = ''
          for (let i = 0; i < event.results.length; i++) {
            const fragment = event.results[i]?.[0]?.transcript || ''
            sessionText += fragment + ' '
          }
          const combined = (dockPersistedTranscriptRef.current ? dockPersistedTranscriptRef.current + ' ' : '') + sessionText
          dockTranscriptRef.current = combined.replace(/\s+/g, ' ').trim()
        }

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error/not permitted:', event.error)
          if (event.error === 'not-allowed') {
            isDockListeningRef.current = false
            showToast('Microphone access blocked. Please allow mic permissions in browser.')
            setVoiceState('ERROR')
          }
        }

        recognition.onend = () => {
          if (isDockListeningRef.current) {
            dockPersistedTranscriptRef.current = dockTranscriptRef.current
            try {
              recognition.start()
            } catch (e) {
              isDockListeningRef.current = false
            }
          }
        }

        recognition.start()
      } catch (e) {
        console.warn('SpeechRecognition failed to start:', e)
      }
    }
  }

  const simulateVoiceInput = (samplePrompt: string) => {
    setVoiceState('PROCESSING')

    // Simulate realistic speech processing delay
    setTimeout(() => {
      setVoiceState('UNDERSTANDING')

      setTimeout(async () => {
        // Try calling Gemini + Sarvam for intent extraction first
        try {
          const res = await fetch('/api/gemini/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: samplePrompt,
              language,
              financialContext: { currentBalance, safeToSpend }
            })
          })
          if (res.ok) {
            const data = await res.json()
            if (data.intentAction?.amount) {
              setVoicePayload({
                intent: 'create_commitment',
                rawText: samplePrompt,
                category: data.intentAction.category || 'Education',
                amount: Number(data.intentAction.amount),
                dueDate: data.intentAction.dueDate || 'Next month',
                priority: 'High priority',
                spokenConfirmation: data.vernacularReply || data.replyText || 'खर्च की पुष्टि करें',
              })
              setVoiceState('CONFIRMATION_REQUIRED')
              return
            } else if (data.replyText) {
              setVoicePayload({
                intent: 'general',
                rawText: samplePrompt,
                spokenConfirmation: data.vernacularReply || data.replyText,
              })
              setVoiceState('COMPLETE')
              return
            }
          }
        } catch (e) {
          console.warn('AI voice intent failed, using rule engine:', e)
        }

        const parsed = parseVoiceIntent(samplePrompt)
        if (parsed.intent === 'create_commitment') {
          setVoicePayload({
            intent: parsed.intent,
            rawText: samplePrompt,
            category: parsed.category,
            amount: parsed.amount,
            dueDate: parsed.dueDate,
            missingFields: parsed.missingFields,
            priority: parsed.confidence === 'RECURRING' ? 'Recurring' : 'High priority',
            spokenConfirmation: parsed.spokenConfirmation,
          })
          setVoiceState(parsed.missingFields?.length ? 'CLARIFICATION_REQUIRED' : 'CONFIRMATION_REQUIRED')
        } else if (parsed.intent === 'check_safe_to_spend') {
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
    if (!voicePayload || voicePayload.missingFields?.length || !voicePayload.amount || !voicePayload.dueDate) return
    setVoiceState('ACTION')

    setTimeout(() => {
      if (voicePayload.intent === 'create_commitment' && voicePayload.amount) {
        const category: Commitment['category'] = ['Education', 'Housing', 'Insurance', 'Bills', 'Family'].includes(voicePayload.category || '')
          ? voicePayload.category as Commitment['category']
          : 'Family'
        addCommitment({
          title: voicePayload.category === 'Education' ? 'College fee (Voice created)' : 'Rent commitment (Voice created)',
          dueDate: voicePayload.dueDate || 'Next month',
          amount: voicePayload.amount,
          category,
          priority: voicePayload.priority || 'High priority',
          notes: `Created via vernacular voice: "${voicePayload.rawText}"`,
        })
      }
      setVoiceState('COMPLETE')
      showToast('Voice commitment confirmed and added to your financial plan!')
    }, 500)
  }

  const cancelVoiceAction = () => {
    isDockListeningRef.current = false
    if (dockRecognitionRef.current) {
      try {
        dockRecognitionRef.current.stop()
      } catch (e) {}
    }
    setVoiceState('IDLE')
    setVoicePayload(null)
  }

  // Language translation helper
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    showToast(`Language set to ${lang}`)
  }

  const updateConsent = (updates: Partial<ConsentState>) => {
    setConsent(previous => ({ ...previous, ...updates }))
    showToast('Consent preferences updated for this demo')
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(previous => ({ ...previous, ...updates }))
    showToast('Profile updated for this demo')
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
        pulseBand: pulseMetrics.band,
        pulseMomentum,
        pulseDrivers: pulseMetrics.drivers,
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
        consent,
        updateConsent,
        profile,
        updateProfile,
        voiceState,
        voicePayload,
        startVoiceListening,
        stopVoiceListening,
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
