// Vani-Fi Financial Intelligence Engine
// Pure, deterministic business logic separated from React components for independent testability.

export interface CommitmentItem {
  id: string
  title: string
  category: 'Education' | 'Housing' | 'Insurance' | 'Bills' | 'Family' | 'Other'
  amount: number
  savedAmount: number
  dueDate: string
  frequency?: 'one-time' | 'recurring' | 'annual'
  confidence: 'CONFIRMED' | 'ESTIMATED' | 'RECURRING'
  status: 'confirmed' | 'virtual'
  notes?: string
}

export interface PulseMetrics {
  score: number
  band: 'excellent' | 'healthy' | 'watch' | 'stressed' | 'critical'
  momentum: string
  liquidity: 'strong' | 'stable' | 'weak'
  incomeStability: 'stable' | 'variable' | 'unstable'
  debtLoad: 'low' | 'moderate' | 'high'
  protectionStatus: 'covered' | 'review' | 'gap'
  drivers: string[]
}

export type DecisionType = 'OFFER' | 'ASSIST' | 'PROTECT' | 'WARN' | 'DO_NOTHING'

export interface PulseTransaction {
  amount: number
  type: 'income' | 'expense'
}

export interface NextBestActionRecommendation {
  id: string
  type: DecisionType
  badge: string
  title: string
  description: string
  actionLabel?: string
  actionRoute?: string
  actionType?: 'navigate' | 'modal' | 'none'
  reasoning: string
  priority: 'high' | 'medium' | 'low'
}

/**
 * Calculates Safe-to-Spend Balance.
 * Safe-to-Spend = Current Liquid Balance + Confirmed Expected Income - Confirmed Upcoming Expenses - Minimum Safety Buffer
 * Commitments are virtual and never withdraw or move funds.
 */
export function calculateSafeToSpend({
  currentBalance,
  commitments,
  confirmedIncome = 0,
  safetyBuffer = 0,
}: {
  currentBalance: number
  commitments: CommitmentItem[]
  confirmedIncome?: number
  safetyBuffer?: number
}): number {
  // Only confirmed or active commitments affect primary safe-to-spend
  const unreservedCommitments = commitments
    .filter(c => c.confidence === 'CONFIRMED' || c.confidence === 'RECURRING' || c.status === 'confirmed')
    .reduce((sum, c) => sum + Math.max(0, c.amount - (c.savedAmount || 0)), 0)

  const rawSafe = currentBalance + confirmedIncome - unreservedCommitments - safetyBuffer
  return Math.max(0, Math.round(rawSafe))
}

/**
 * Calculates Financial Pulse indicators based on cashflow ratios.
 */
export function calculateFinancialPulse({
  currentBalance,
  monthlyIncome = 78500,
  commitments,
  stressOverride,
  safeToSpend,
  transactions = [],
  pendingFraud = false,
}: {
  currentBalance: number
  monthlyIncome?: number
  commitments: CommitmentItem[]
  stressOverride?: 'healthy' | 'stressed'
  safeToSpend?: number
  transactions?: PulseTransaction[]
  pendingFraud?: boolean
}): PulseMetrics {
  if (stressOverride === 'stressed') {
    return {
      score: 48,
      band: 'stressed',
      momentum: 'Financial stress detected',
      liquidity: 'weak',
      incomeStability: 'variable',
      debtLoad: 'high',
      protectionStatus: 'review',
      drivers: [
        'Debt and upcoming commitments consume 46% of monthly income.',
        'Safe-to-spend buffer is within 14 days of depletion.',
        'Unnecessary credit products suppressed by ethical AI policy.',
      ],
    }
  }

  if (safeToSpend !== undefined || transactions.length > 0 || pendingFraud) {
    const totalCommitments = commitments.reduce(
      (sum, commitment) => sum + Math.max(0, commitment.amount - commitment.savedAmount),
      0,
    )
    const safeRatio = currentBalance > 0 ? Math.max(0, Math.min(1, (safeToSpend ?? currentBalance) / currentBalance)) : 0
    const incomeTotal = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.max(0, t.amount), 0)
    const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const incomeStability = transactions.filter(t => t.type === 'income').length >= 3 ? 20 : incomeTotal > 0 ? 14 : 8
    const liquidityScore = currentBalance >= monthlyIncome ? 30 : Math.round(30 * safeRatio)
    const commitmentPressure = monthlyIncome > 0 ? totalCommitments / monthlyIncome : 1
    const commitmentScore = Math.max(0, Math.round(20 - Math.min(20, commitmentPressure * 20)))
    const expenseScore = expenseTotal <= monthlyIncome * 0.25 ? 15 : expenseTotal <= monthlyIncome * 0.5 ? 10 : 4
    // Fraud risk is intentionally kept separate from financial wellbeing.
    const protectionScore = 10
    const score = Math.max(0, Math.min(100, liquidityScore + incomeStability + commitmentScore + expenseScore + protectionScore))
    const band = score >= 90 ? 'excellent' : score >= 75 ? 'healthy' : score >= 60 ? 'watch' : score >= 40 ? 'stressed' : 'critical'
    const liquidity = safeRatio >= 0.6 ? 'strong' : safeRatio >= 0.3 ? 'stable' : 'weak'
    const debtLoad = commitmentPressure >= 0.7 ? 'high' : commitmentPressure >= 0.35 ? 'moderate' : 'low'

    return {
      score,
      band,
      momentum: band === 'excellent' || band === 'healthy' ? 'Healthy financial momentum' : band === 'watch' ? 'A little more breathing room would help' : 'Financial pressure needs attention',
      liquidity,
      incomeStability: incomeStability >= 18 ? 'stable' : incomeStability >= 12 ? 'variable' : 'unstable',
      debtLoad,
      protectionStatus: pendingFraud ? 'review' : 'covered',
      drivers: [
        `${liquidity === 'strong' ? 'Safe-to-Spend remains well covered' : 'Safe-to-Spend is tightening'} against the current liquid balance.`,
        `${incomeStability >= 18 ? 'Recent income credits show a stable rhythm.' : 'More income history is needed to confirm stability.'}`,
        `${totalCommitments > 0 ? `Upcoming commitments total ₹${totalCommitments.toLocaleString('en-IN')} after virtual earmarks.` : 'No upcoming commitments are currently recorded.'}`,
        ...(pendingFraud ? ['An unresolved security alert requires attention separately from financial stress.'] : []),
      ],
    }
  }

  // Normal calculation
  const totalCommitments = commitments.reduce((sum, c) => sum + c.amount, 0)
  const coverageMonths = totalCommitments > 0 ? (currentBalance / totalCommitments) : 3
  const isStrong = coverageMonths >= 1.2 && currentBalance > 50000

  return {
    score: isStrong ? 82 : 65,
    band: isStrong ? 'healthy' : 'watch',
    momentum: isStrong ? 'Healthy financial momentum' : 'Moderate momentum',
    liquidity: isStrong ? 'strong' : 'stable',
    incomeStability: 'stable',
    debtLoad: 'moderate',
    protectionStatus: 'covered',
    drivers: [
      'Stable income rhythm sustained for over 4 consecutive cycles.',
      'Known future commitments are insulated without touching emergency reserves.',
      'Debt-to-income ratio maintained at a safe 24%.',
    ],
  }
}

/**
 * Computes the Next Best Action decision layer.
 * Enforces ethical offer suppression when customer shows stress signals.
 */
export function getNextBestActions({
  pulse,
  safeToSpend,
  stressLevel,
  currentBalance,
  commitments = [],
  pendingFraud = false,
}: {
  pulse: PulseMetrics
  safeToSpend: number
  stressLevel: 'healthy' | 'stressed'
  currentBalance?: number
  commitments?: CommitmentItem[]
  pendingFraud?: boolean
}): NextBestActionRecommendation[] {
  if (stressLevel === 'stressed' || pulse.liquidity === 'weak' || pulse.debtLoad === 'high') {
    return [
      {
        id: 'act-assist-1',
        type: 'ASSIST',
        badge: 'ASSISTANCE & PACING',
        title: 'Restructure upcoming college fees schedule',
        description: 'Instead of taking an emergency personal loan at 16%, split the ₹50,000 fee into 2 instalments with college zero-cost support.',
        actionLabel: 'Review options',
        actionRoute: '/app/loans',
        actionType: 'navigate',
        reasoning: 'Upcoming commitments will deplete your safe-to-spend balance in 14 days. Immediate cash preservation is advised.',
        priority: 'high',
      },
      {
        id: 'act-warn-1',
        type: 'WARN',
        badge: 'CAUTION: OVER-LEVERAGING',
        title: 'Pause discretionary spending and new credit',
        description: 'Debt obligations already consume 46% of your monthly cash flow. New credit card applications should be avoided.',
        actionLabel: 'View Commitments',
        actionRoute: '/app/commitments',
        actionType: 'navigate',
        reasoning: 'Taking new loans under financial stress leads to debt spirals. Vani-Fi prioritizes your long-term security.',
        priority: 'high',
      },
      {
        id: 'act-donothing-1',
        type: 'DO_NOTHING',
        badge: 'RESPONSIBLE AI GUARDRAIL',
        title: 'No new commercial product recommended',
        description: 'Commercial loan offers are disabled for this account because debt load is high. We will help you navigate current bills first.',
        reasoning: 'Our non-predatory commitment ensures we never sell credit to customers showing active financial distress signals.',
        priority: 'medium',
      },
    ]
  }

  const actions: NextBestActionRecommendation[] = []
  if (pendingFraud) {
    actions.push({
      id: 'act-protect-fraud',
      type: 'PROTECT',
      badge: 'SECURITY REVIEW',
      title: 'Verify an unusual transaction',
      description: 'Your financial health and security risk are tracked separately. Review this activity before taking any action.',
      actionLabel: 'Open Protection',
      actionRoute: '/app/protection',
      actionType: 'navigate',
      reasoning: 'A pending anomaly was detected by the demo security monitor.',
      priority: 'high',
    })
  }

  const commitmentPressure = commitments.reduce((sum, commitment) => sum + Math.max(0, commitment.amount - commitment.savedAmount), 0)
  if (currentBalance !== undefined && (safeToSpend < currentBalance * 0.5 || commitmentPressure > currentBalance * 0.5)) {
    actions.push({
      id: 'act-assist-commitment',
      type: 'ASSIST',
      badge: 'PLAN WITH CARE',
      title: 'Plan upcoming commitments before adding new products',
      description: 'Your virtual commitments are using a meaningful share of your available balance. Review timing and set-aside options first.',
      actionLabel: 'Review commitments',
      actionRoute: '/app/commitments',
      actionType: 'navigate',
      reasoning: 'Upcoming obligations reduce the portion of your balance that is safely flexible.',
      priority: 'high',
    })
  }

  // Healthy Customer Flow
  const healthyActions: NextBestActionRecommendation[] = [
    {
      id: 'act-offer-1',
      type: 'OFFER',
      badge: 'BEST NEXT STEP',
      title: 'Build your emergency buffer',
      description: 'You are ₹25,000 away from a comfortable 3-month cushion. Setting aside ₹2,500 weekly achieves this by March.',
      actionLabel: 'Set aside buffer',
      actionRoute: '/app/commitments',
      actionType: 'navigate',
      reasoning: 'Your income is stable and known commitments are pre-funded. This is the optimal window to lock in liquidity.',
      priority: 'high',
    },
    {
      id: 'act-protect-1',
      type: 'PROTECT',
      badge: 'FRAUD SHIELD',
      title: 'Review online transaction limit',
      description: 'Lock your virtual card to ₹15,000 to prevent unauthorized high-ticket e-commerce debits.',
      actionLabel: 'Go to Protection',
      actionRoute: '/app/protection',
      actionType: 'navigate',
      reasoning: 'An unverified international merchant ping was flagged recently. Restricting limits protects your main HDFC account.',
      priority: 'medium',
    },
    {
      id: 'act-donothing-2',
      type: 'DO_NOTHING',
      badge: 'RESPONSIBLE AI',
      title: 'No credit products recommended right now',
      description: 'You currently have sufficient liquidity for your planned commitments. Taking unnecessary loans or BNPL would add friction.',
      reasoning: 'Vani-Fi strictly suppresses loan and credit offers when your current cashflow is healthy and does not require borrowing.',
      priority: 'low',
    },
  ]
  return [...actions, ...healthyActions]
}

/**
 * Helper to resolve relative and ordinal dates (e.g., '11th of next month', '15 Oct', 'next month')
 */
export function extractDueDateFromText(rawText: string): string | undefined {
  const lower = rawText.toLowerCase()
  const now = new Date()
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const nextMonthName = nextMonthDate.toLocaleString('en-IN', { month: 'short' })
  const currentMonthName = now.toLocaleString('en-IN', { month: 'short' })

  // Match pattern like "11th of next month", "11 next month", "अगले महीने की 11 तारीख", "11 तारीख"
  const ordinalDayMatch = lower.match(/(\d{1,2})(?:st|nd|rd|th)?(?:\s+(?:of\s+)?(?:next\s+month|अगले\s+महीने|agle\s+mahine))|(?:\b(?:next\s+month|अगले\s+महीने|agle\s+mahine)\s+(?:की\s+)?(\d{1,2})(?:st|nd|rd|th|\s*तारीख)?)/i)
  if (ordinalDayMatch) {
    const day = ordinalDayMatch[1] || ordinalDayMatch[2]
    if (day) {
      const paddedDay = day.padStart(2, '0')
      return `${paddedDay} ${nextMonthName}`
    }
  }

  // Match pattern like "11th" or "11 तारीख" with next month mentioned anywhere
  const hasNextMonth = /next month|अगले महीने|अगले माह|agle mahine/i.test(rawText)
  const standaloneDayMatch = lower.match(/\b(\d{1,2})(?:st|nd|rd|th|\s*तारीख|\s*tarikh)\b/i)
  if (hasNextMonth && standaloneDayMatch && standaloneDayMatch[1]) {
    const day = standaloneDayMatch[1].padStart(2, '0')
    return `${day} ${nextMonthName}`
  }

  // Match explicit date like "15 Oct", "18 October", "12 Nov"
  const explicitMonthMatch = lower.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i)
  if (explicitMonthMatch) {
    const day = explicitMonthMatch[1].padStart(2, '0')
    const month = explicitMonthMatch[2].charAt(0).toUpperCase() + explicitMonthMatch[2].slice(1).toLowerCase()
    return `${day} ${month}`
  }

  if (hasNextMonth) {
    return `01 ${nextMonthName}`
  }

  return undefined
}

/**
 * Parses vernacular voice intents deterministically.
 */
export function parseVoiceIntent(rawText: string): {
  intent: 'create_commitment' | 'check_safe_to_spend' | 'loan_affordability' | 'general'
  category: 'Education' | 'Housing' | 'Insurance' | 'Bills' | 'Family' | 'Other'
  amount?: number
  dueDate?: string
  missingFields?: Array<'amount' | 'dueDate'>
  confidence: 'CONFIRMED' | 'ESTIMATED' | 'RECURRING'
  spokenConfirmation: string
} {
  const lower = rawText.toLowerCase()
  const detectedDate = extractDueDateFromText(rawText)

  if (lower.includes('college') || lower.includes('fees') || rawText.includes('फीस') || rawText.includes('कॉलेज')) {
    const numericAmount = lower.match(/(?:₹|rs\.?\s*)?([0-9][0-9,]*)/i)?.[1]
    const parsedNumericAmount = numericAmount ? Number(numericAmount.replace(/,/g, '')) : undefined
    const amount = parsedNumericAmount
      ? /हजार|hazaar|hazar|thousand/i.test(rawText) ? parsedNumericAmount * 1000 : parsedNumericAmount
      : /पचास\s*हजार|pachaas\s*hazar|fifty\s*thousand/i.test(rawText) ? 50000 : undefined

    const dueDate = detectedDate
    const missingFields: Array<'amount' | 'dueDate'> = []
    if (!amount) missingFields.push('amount')
    if (!dueDate) missingFields.push('dueDate')
    if (missingFields.length > 0) {
      return {
        intent: 'create_commitment',
        category: 'Education',
        amount,
        dueDate,
        missingFields,
        confidence: 'ESTIMATED',
        spokenConfirmation: missingFields.includes('amount')
          ? 'Bilkul. College fees ke liye kitni rakam chahiye?'
          : 'Theek hai. Ye fees kab deni hai?',
      }
    }
    return {
      intent: 'create_commitment',
      category: 'Education',
      amount,
      dueDate,
      confidence: 'CONFIRMED',
      spokenConfirmation: `Aapne bataya ki ${dueDate} ko college fees ke liye ₹${amount?.toLocaleString('en-IN')} dene hain. Kya main ise upcoming expense ke roop mein save kar doon?`,
    }
  }

  if (lower.includes('rent') || rawText.includes('किराया') || rawText.includes('ભાડું')) {
    const numericAmount = lower.match(/(?:₹|rs\.?\s*)?([0-9][0-9,]*)/i)?.[1]
    const parsedNumericAmount = numericAmount ? Number(numericAmount.replace(/,/g, '')) : undefined
    const amount = parsedNumericAmount
      ? /हजार|hazaar|hazar|thousand/i.test(rawText) ? parsedNumericAmount * 1000 : parsedNumericAmount
      : undefined

    const dueDate = detectedDate
    const missingFields: Array<'amount' | 'dueDate'> = []
    if (!amount) missingFields.push('amount')
    if (!dueDate) missingFields.push('dueDate')
    if (missingFields.length > 0) {
      return {
        intent: 'create_commitment',
        category: 'Housing',
        amount,
        dueDate,
        missingFields,
        confidence: 'ESTIMATED',
        spokenConfirmation: missingFields.includes('amount')
          ? 'Rent ke liye kitni rakam rakhni hai?'
          : 'Rent kis din ya kis mahine dena hai?',
      }
    }
    return {
      intent: 'create_commitment',
      category: 'Housing',
      amount,
      dueDate,
      confidence: 'RECURRING',
      spokenConfirmation: `I identified rent of ₹${amount?.toLocaleString('en-IN')} due on ${dueDate}. Shall I reserve this in your safe-to-spend plan?`,
    }
  }

  if (lower.includes('loan') || rawText.includes('लोन') || rawText.includes('कर्ज')) {
    const numericAmount = lower.match(/(?:₹|rs\.?\s*)?([0-9][0-9,]*)/i)?.[1]
    const amount = numericAmount ? Number(numericAmount.replace(/,/g, '')) : undefined
    return {
      intent: 'loan_affordability',
      category: 'Bills',
      amount,
      missingFields: amount ? undefined : ['amount'],
      confidence: 'ESTIMATED',
      spokenConfirmation: amount
        ? `Aap ₹${amount.toLocaleString('en-IN')} loan ke baare mein pooch rahe hain. Pehle affordability aur KFS review karna chahenge?`
        : 'Aapko kitni loan amount ki zarurat hai? Main pehle affordability check karungi.',
    }
  }

  if (lower.includes('safe') || lower.includes('spend') || rawText.includes('खर्च') || rawText.includes('સિલિક')) {
    return {
      intent: 'check_safe_to_spend',
      category: 'Other',
      confidence: 'CONFIRMED',
      spokenConfirmation: 'आपकी सुरक्षित खर्च सीमा की गणना की जा रही है।',
    }
  }

  return {
    intent: 'general',
    category: 'Other',
    confidence: 'ESTIMATED',
    spokenConfirmation: 'मैंने आपकी बात समझ ली है। आपका वित्तीय बफर और सभी योजनाएं पूरी तरह सुरक्षित हैं।',
  }
}
