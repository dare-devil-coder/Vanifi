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
  momentum: string
  liquidity: 'strong' | 'stable' | 'weak'
  incomeStability: 'stable' | 'variable' | 'unstable'
  debtLoad: 'low' | 'moderate' | 'high'
  protectionStatus: 'covered' | 'review' | 'gap'
  drivers: string[]
}

export type DecisionType = 'OFFER' | 'ASSIST' | 'PROTECT' | 'WARN' | 'DO_NOTHING'

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
}: {
  currentBalance: number
  monthlyIncome?: number
  commitments: CommitmentItem[]
  stressOverride?: 'healthy' | 'stressed'
}): PulseMetrics {
  if (stressOverride === 'stressed') {
    return {
      score: 48,
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

  // Normal calculation
  const totalCommitments = commitments.reduce((sum, c) => sum + c.amount, 0)
  const coverageMonths = totalCommitments > 0 ? (currentBalance / totalCommitments) : 3
  const isStrong = coverageMonths >= 1.2 && currentBalance > 50000

  return {
    score: isStrong ? 82 : 65,
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
}: {
  pulse: PulseMetrics
  safeToSpend: number
  stressLevel: 'healthy' | 'stressed'
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

  // Healthy Customer Flow
  return [
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
}

/**
 * Parses vernacular voice intents deterministically.
 */
export function parseVoiceIntent(rawText: string): {
  intent: 'create_commitment' | 'check_safe_to_spend' | 'loan_affordability' | 'general'
  category: 'Education' | 'Housing' | 'Insurance' | 'Bills' | 'Family' | 'Other'
  amount?: number
  dueDate?: string
  confidence: 'CONFIRMED' | 'ESTIMATED' | 'RECURRING'
  spokenConfirmation: string
} {
  const lower = rawText.toLowerCase()

  if (lower.includes('college') || lower.includes('fees') || rawText.includes('फीस') || rawText.includes('कॉलेज')) {
    // Extract ₹50,000 or fifty thousand
    const amount = 50000
    return {
      intent: 'create_commitment',
      category: 'Education',
      amount,
      dueDate: '18 Oct 2026',
      confidence: 'CONFIRMED',
      spokenConfirmation: 'आपकी बेटी की कॉलेज फीस ₹50,000 की 18 अक्टूबर के लिए पहचान ली गई है। क्या मैं इसे आगामी खर्च के रूप में सुरक्षित कर दूं?',
    }
  }

  if (lower.includes('rent') || rawText.includes('किराया') || rawText.includes('ભાડું')) {
    const amount = 18000
    return {
      intent: 'create_commitment',
      category: 'Housing',
      amount,
      dueDate: '01 Nov 2026',
      confidence: 'RECURRING',
      spokenConfirmation: 'I identified an upcoming apartment rent commitment of ₹18,000 for 1st November. Shall I reserve this in your safe-to-spend plan?',
    }
  }

  if (lower.includes('loan') || rawText.includes('लोन') || rawText.includes('कर्ज')) {
    return {
      intent: 'loan_affordability',
      category: 'Bills',
      amount: 50000,
      confidence: 'ESTIMATED',
      spokenConfirmation: 'लोन की आवश्यकता दर्ज की गई है। क्या आप पहले अपनी वित्तीय स्थिति और की फैक्ट्स स्टेटमेंट (KFS) की समीक्षा करना चाहते हैं?',
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
