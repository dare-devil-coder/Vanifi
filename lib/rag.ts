import { Pinecone } from '@pinecone-database/pinecone'

export interface KnowledgeMatch {
  id: string
  score: number
  metadata: Record<string, any>
  text: string
}

export function normalizeQuestion(input: string): string {
  return (input || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function detectPromptInjection(input: string): { isInjected: boolean; reason: string | null } {
  const q = (input || '').toLowerCase()
  const injectionPatterns = [
    'ignore all previous instructions',
    'override the system',
    'ignore your financial knowledge',
    'bypass the rules',
    'system prompt',
    'developer prompt',
    'reveal hidden instructions',
    'act as if',
    'you are now',
    'pretend to be',
  ]

  const matched = injectionPatterns.find(pattern => q.includes(pattern))
  if (matched) {
    return {
      isInjected: true,
      reason: `Prompt attempted to override instructions by asking to: ${matched}.`,
    }
  }

  return { isInjected: false, reason: null }
}

export function buildKnowledgeContext(matches: Array<{ score?: number; metadata?: Record<string, any>; text?: string }>, question: string): string {
  const normalizedQuestion = normalizeQuestion(question)
  const filtered: Array<{ text: string; source: string; score: number }> = (matches || [])
    .map(match => {
      const text = String(match?.metadata?.text || match?.metadata?.chunk_text || match?.text || '').trim()
      if (!text) return null

      const score = typeof match?.score === 'number' ? match.score : 0
      const source = String(match?.metadata?.source || match?.metadata?.title || 'knowledge-base')

      if (normalizedQuestion && text) {
        const textNormalized = normalizeQuestion(text)
        const relevant = textNormalized.includes(normalizedQuestion) || normalizedQuestion.includes(textNormalized) || (textNormalized.includes('emi') && normalizedQuestion.includes('emi'))
        if (!relevant && !source.toLowerCase().includes('pm') && !source.toLowerCase().includes('loan') && !source.toLowerCase().includes('fraud')) {
          return null
        }
      }

      return {
        text,
        source,
        score,
      }
    })
    .filter((item): item is { text: string; source: string; score: number } => item !== null)
    .slice(0, 4)

  if (!filtered.length) {
    return 'No relevant knowledge-base context was available for this prompt.'
  }

  return filtered
    .map(item => `Source: ${item.source} (confidence: ${(Number(item.score || 0) * 100).toFixed(0)}%)\n${item.text}`)
    .join('\n\n')
}

export async function queryFinancialKnowledge(question: string): Promise<{ matches: KnowledgeMatch[]; source: 'pinecone' | 'fallback' | 'unavailable'; error?: string }> {
  const prompt = (question || '').trim()
  if (!prompt) {
    return { matches: [], source: 'fallback', error: 'Empty question provided to knowledge base.' }
  }

  const apiKey = process.env.PINECONE_API_KEY
  if (!apiKey) {
    return { matches: [], source: 'unavailable', error: 'PINECONE_API_KEY is not configured.' }
  }

  try {
    const pc = new Pinecone({ apiKey })
    const index = pc.index({ name: 'vani', namespace: 'financial_knowledge' })
    const candidateModels = ['llama-text-embed-v2', 'multilingual-e5-large']
    let vector: number[] = []

    for (const model of candidateModels) {
      try {
        const embeddingResponse = await pc.inference.embed({
          model,
          inputs: [prompt],
          parameters: { inputType: 'query' },
        })

        const first = embeddingResponse?.data?.[0] as any
        const denseValues = Array.isArray(first?.values) ? first.values : []
        const embeddedValues = Array.isArray(first?.embedding) ? first.embedding : []
        const values = denseValues.length > 0 ? denseValues : embeddedValues
        if (values.length > 0) {
          vector = values
          break
        }
      } catch {
        // move to next supported model if the configured embedding model is unavailable
      }
    }

    if (!vector.length) {
      return { matches: [], source: 'fallback', error: 'Pinecone inference returned no embedding values.' }
    }

    const result = await index.query({
      vector,
      topK: 5,
      includeMetadata: true,
      includeValues: false,
    })

    const matches = (result?.matches ?? []).map((match: any) => ({
      id: String(match?.id || match?.metadata?.chunk_id || 'unknown'),
      score: Number(match?.score ?? match?.$score ?? 0),
      metadata: match?.metadata ?? {},
      text: String(match?.metadata?.text || match?.metadata?.chunk_text || match?.text || '').trim(),
    })).filter((match: KnowledgeMatch) => Boolean(match.text))

    return {
      matches,
      source: matches.length > 0 ? 'pinecone' : 'fallback',
    }
  } catch (error: any) {
    return {
      matches: [],
      source: 'unavailable',
      error: error?.message || 'Pinecone knowledge lookup failed.',
    }
  }
}
