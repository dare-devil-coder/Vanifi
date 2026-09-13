import test from 'node:test'
import assert from 'node:assert/strict'

import { createGroundedFallbackResponse } from '../lib/gemini.ts'

test('fallback gives a conservative answer for an unsupported financial query', () => {
  const result = createGroundedFallbackResponse('What is the weather today?')
  assert.match(result.replyText, /I don['’]?t have enough information|current knowledge base/i)
})

test('fallback explains EMI without inventing details', () => {
  const result = createGroundedFallbackResponse('What is EMI?')
  assert.match(result.replyText, /EMI|Equated Monthly Installment/i)
  assert.doesNotMatch(result.replyText, /₹\s*\d{5,}/)
})
