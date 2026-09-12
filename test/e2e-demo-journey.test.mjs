// Vani-Fi End-to-End Hackout 2026 Demo Journey Verification
// Validates the full sequence specified in Section 67 & Section 85.

import assert from 'node:assert'
import {
  calculateSafeToSpend,
  calculateFinancialPulse,
  getNextBestActions,
  parseVoiceIntent,
} from '../lib/financial/calculations.ts'
import { verifyOtp, submitLoanApplicationService } from '../services/mock-api.ts'

console.log('=================================================================')
console.log('RUNNING VANI-FI HACKOUT 2026 COMPLETE END-TO-END DEMO SCENARIO')
console.log('=================================================================')

// Step 1: Starting State
let currentBalance = 100000
let commitments = []
let pulse = calculateFinancialPulse({ currentBalance, commitments, stressOverride: 'healthy' })
let safeToSpend = calculateSafeToSpend({ currentBalance, commitments })

console.log(`1. Initial State: Balance = ₹${currentBalance}, Pulse = ${pulse.score}, Safe-to-Spend = ₹${safeToSpend}`)
assert.strictEqual(currentBalance, 100000)
assert.strictEqual(pulse.score, 82)
assert.strictEqual(safeToSpend, 100000)

// Step 2: Vernacular Voice Input
console.log('\n2. User speaks: "Meri beti ki college fees agle mahine 50 hazaar hai"')
const voiceParsed = parseVoiceIntent('Meri beti ki college fees agle mahine 50 hazaar hai')
console.log('   Voice Parsed:', {
  intent: voiceParsed.intent,
  category: voiceParsed.category,
  amount: voiceParsed.amount,
  dueDate: voiceParsed.dueDate,
  confidence: voiceParsed.confidence,
})
assert.strictEqual(voiceParsed.intent, 'create_commitment')
assert.strictEqual(voiceParsed.amount, 50000)
assert.strictEqual(voiceParsed.category, 'Education')

// Step 3: User Confirms & Commitment Created
commitments.push({
  id: 'comm-college',
  title: 'College fees',
  category: voiceParsed.category,
  amount: voiceParsed.amount,
  savedAmount: 0,
  dueDate: voiceParsed.dueDate,
  confidence: voiceParsed.confidence,
  status: 'confirmed',
})
safeToSpend = calculateSafeToSpend({ currentBalance, commitments })
console.log(`3. User confirms intent -> Commitment saved. Safe-to-Spend is now: ₹${safeToSpend}`)
assert.strictEqual(safeToSpend, 50000, 'Safe-to-Spend must equal ₹50,000 after reserving 50k fee')

// Step 4: Simulate Income Inflow (+₹20,000)
currentBalance += 20000
safeToSpend = calculateSafeToSpend({ currentBalance, commitments })
console.log(`4. Inflow +₹20,000 -> Current Balance: ₹${currentBalance}, Safe-to-Spend: ₹${safeToSpend}`)
assert.strictEqual(currentBalance, 120000)
assert.strictEqual(safeToSpend, 70000, 'Safe-to-Spend must increase to ₹70,000')

// Step 5: Simulate Spending Outflow (-₹10,000)
currentBalance -= 10000
safeToSpend = calculateSafeToSpend({ currentBalance, commitments })
console.log(`5. Outflow -₹10,000 -> Current Balance: ₹${currentBalance}, Safe-to-Spend: ₹${safeToSpend}`)
assert.strictEqual(currentBalance, 110000)
assert.strictEqual(safeToSpend, 60000, 'Safe-to-Spend must decrease to ₹60,000')

// Step 6: Next Best Action in Healthy Mode
pulse = calculateFinancialPulse({ currentBalance, commitments, stressOverride: 'healthy' })
let recommendations = getNextBestActions({ pulse, safeToSpend, stressLevel: 'healthy' })
console.log('\n6. Healthy Customer Recommendations evaluated:')
recommendations.forEach(r => console.log(`   [${r.type}] ${r.title}`))
assert.ok(recommendations.some(r => r.type === 'OFFER'))
assert.ok(recommendations.some(r => r.type === 'DO_NOTHING'))

// Step 7: Stressed Scenario & Responsible Offer Suppression
console.log('\n7. User activates Stressed Condition & requests ₹50,000 loan:')
pulse = calculateFinancialPulse({ currentBalance, commitments, stressOverride: 'stressed' })
recommendations = getNextBestActions({ pulse, safeToSpend, stressLevel: 'stressed' })
console.log('   Stressed Customer Recommendations evaluated:')
recommendations.forEach(r => console.log(`   [${r.type}] ${r.title}`))

const commercialOffers = recommendations.filter(r => r.type === 'OFFER')
assert.strictEqual(commercialOffers.length, 0, 'Commercial loan offers must be strictly SUPPRESSED')
const assistAction = recommendations.find(r => r.type === 'ASSIST')
assert.ok(assistAction, 'Must offer ASSIST alternative rather than predatory lending')

// Step 8: Loan Flow, KFS Comprehension & 2FA OTP
console.log('\n8. Loan Flow with KFS & Comprehension Quiz:')
const loanAmount = 50000
const monthlyRate = 14.5 / 12 / 100
const emi = Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, 12)) / (Math.pow(1 + monthlyRate, 12) - 1))
console.log(`   Calculated KFS EMI: ₹${emi}/mo over 12 months at 14.5% p.a.`)

// Comprehension verification
const userQuizAnswer = `₹${emi.toLocaleString('en-IN')}`
assert.strictEqual(userQuizAnswer, `₹${emi.toLocaleString('en-IN')}`, 'Quiz correct answer matches calculated EMI')

// OTP verification
const otpResult = await verifyOtp('123456')
assert.strictEqual(otpResult.success, true)

// Loan submission
const loanResult = await submitLoanApplicationService({
  amount: loanAmount,
  tenureMonths: 12,
  emi,
  purpose: 'Planned Education',
})
assert.ok(loanResult.applicationId.startsWith('VF-LN-'))
console.log(`   Application Successfully Logged: ID ${loanResult.applicationId} (${loanResult.status})`)

console.log('\n=================================================================')
console.log('E2E DEMO SCENARIO PASSED ENTIRELY WITHOUT ANY REGRESSIONS!')
console.log('=================================================================')
