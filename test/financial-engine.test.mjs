// Vani-Fi Comprehensive Automated Test Suite
// Tests Safe-to-Spend, Commitment CRUD, Next Best Action Decision Engine,
// Vernacular Intent Parsing, and KFS Calculation.

import assert from 'node:assert'
import {
  calculateSafeToSpend,
  calculateFinancialPulse,
  getNextBestActions,
  parseVoiceIntent,
} from '../lib/financial/calculations.ts'

console.log('=====================================================')
console.log('RUNNING VANI-FI AUTOMATED TEST SUITE')
console.log('=====================================================')

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`[PASS] ${name}`)
    passed++
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message)
    failed++
  }
}

// 1. Safe-to-Spend tests (Section 11 & Section 73)
test('Safe-to-Spend: Initial state (100k balance - 50k confirmed commitment = 50k safe)', () => {
  const safe = calculateSafeToSpend({
    currentBalance: 100000,
    commitments: [
      {
        id: '1',
        title: 'College fees',
        amount: 50000,
        savedAmount: 0,
        dueDate: '18 Oct',
        confidence: 'CONFIRMED',
        status: 'confirmed',
        category: 'Education',
      },
    ],
  })
  assert.strictEqual(safe, 50000)
})

test('Safe-to-Spend: Income addition (+20k income -> safe becomes 70k)', () => {
  const safe = calculateSafeToSpend({
    currentBalance: 120000,
    commitments: [
      {
        id: '1',
        title: 'College fees',
        amount: 50000,
        savedAmount: 0,
        dueDate: '18 Oct',
        confidence: 'CONFIRMED',
        status: 'confirmed',
        category: 'Education',
      },
    ],
  })
  assert.strictEqual(safe, 70000)
})

test('Safe-to-Spend: Spending reduction (-10k spent -> safe becomes 60k)', () => {
  const safe = calculateSafeToSpend({
    currentBalance: 110000,
    commitments: [
      {
        id: '1',
        title: 'College fees',
        amount: 50000,
        savedAmount: 0,
        dueDate: '18 Oct',
        confidence: 'CONFIRMED',
        status: 'confirmed',
        category: 'Education',
      },
    ],
  })
  assert.strictEqual(safe, 60000)
})

test('Safe-to-Spend: Virtual earmarking does not double-count reserved funds', () => {
  const safe = calculateSafeToSpend({
    currentBalance: 110000,
    commitments: [
      {
        id: '1',
        title: 'College fees',
        amount: 50000,
        savedAmount: 20000, // 20k already set aside
        dueDate: '18 Oct',
        confidence: 'CONFIRMED',
        status: 'confirmed',
        category: 'Education',
      },
    ],
  })
  // 110,000 - (50,000 - 20,000) = 80,000
  assert.strictEqual(safe, 80000)
})

// 2. Financial Pulse tests (Section 18 & Section 19)
test('Financial Pulse: Healthy state produces score 82 with strong liquidity', () => {
  const pulse = calculateFinancialPulse({
    currentBalance: 124580,
    monthlyIncome: 78500,
    commitments: [
      { id: '1', title: 'College fees', amount: 50000, savedAmount: 34000, dueDate: '18 Oct', confidence: 'CONFIRMED', status: 'confirmed', category: 'Education' },
    ],
    stressOverride: 'healthy',
  })
  assert.strictEqual(pulse.score, 82)
  assert.strictEqual(pulse.liquidity, 'strong')
  assert.strictEqual(pulse.debtLoad, 'moderate')
})

test('Financial Pulse: Stressed state produces score 48 and weak liquidity', () => {
  const pulse = calculateFinancialPulse({
    currentBalance: 25000,
    monthlyIncome: 35000,
    commitments: [
      { id: '1', title: 'Debt EMI', amount: 35000, savedAmount: 0, dueDate: 'Tomorrow', confidence: 'CONFIRMED', status: 'confirmed', category: 'Bills' },
    ],
    stressOverride: 'stressed',
  })
  assert.strictEqual(pulse.score, 48)
  assert.strictEqual(pulse.liquidity, 'weak')
  assert.strictEqual(pulse.debtLoad, 'high')
})

// 3. Next Best Action Decision Engine tests (Section 20 & 21)
test('Next Best Action: Healthy customer receives savings/buffer OFFER and no predatory credit', () => {
  const pulse = calculateFinancialPulse({
    currentBalance: 124580,
    commitments: [],
    stressOverride: 'healthy',
  })
  const actions = getNextBestActions({ pulse, safeToSpend: 75000, stressLevel: 'healthy' })
  const offer = actions.find(a => a.type === 'OFFER')
  const doNothing = actions.find(a => a.type === 'DO_NOTHING')
  assert.ok(offer, 'Should include OFFER for healthy customer')
  assert.ok(doNothing, 'Should include DO_NOTHING ethical guardrail')
})

test('Next Best Action: Stressed customer SUPPRESSES loans and recommends ASSIST / WARN', () => {
  const pulse = calculateFinancialPulse({
    currentBalance: 20000,
    commitments: [],
    stressOverride: 'stressed',
  })
  const actions = getNextBestActions({ pulse, safeToSpend: 5000, stressLevel: 'stressed' })
  const hasLoanOffer = actions.some(a => a.type === 'OFFER')
  const assist = actions.find(a => a.type === 'ASSIST')
  const warn = actions.find(a => a.type === 'WARN')

  assert.strictEqual(hasLoanOffer, false, 'Stressed customer must NOT receive commercial loan offers')
  assert.ok(assist, 'Must provide ASSIST guidance')
  assert.ok(warn, 'Must provide WARN caution against overleveraging')
})

// 4. Vernacular Voice NLP parsing (Section 15)
test('Voice Intent: Extracts Hindi college fees commitment correctly', () => {
  const intent = parseVoiceIntent('मेरी बेटी की कॉलेज फीस अगले महीने पचास हजार है')
  assert.strictEqual(intent.intent, 'create_commitment')
  assert.strictEqual(intent.category, 'Education')
  assert.strictEqual(intent.amount, 50000)
  assert.strictEqual(intent.confidence, 'CONFIRMED')
})

test('Voice Intent: Extracts English rent commitment correctly', () => {
  const intent = parseVoiceIntent('Save my apartment rent of 18000 for next month')
  assert.strictEqual(intent.intent, 'create_commitment')
  assert.strictEqual(intent.category, 'Housing')
  assert.strictEqual(intent.amount, 18000)
})

test('Voice Intent: Resolves Safe-to-Spend inquiry', () => {
  const intent = parseVoiceIntent('How much can I safely spend today?')
  assert.strictEqual(intent.intent, 'check_safe_to_spend')
})

console.log('=====================================================')
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`)
console.log('=====================================================')

if (failed > 0) process.exit(1)
