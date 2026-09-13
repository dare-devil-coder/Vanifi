import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (match) env[match[1]] = match[2];
}

const report = {
  geminiConfigured: Boolean(env.GEMINI_API_KEY),
  pineconeConfigured: Boolean(env.PINECONE_API_KEY),
  sarvamConfigured: Boolean(env.SARVAM_API_KEY),
  pineconeIndexEnv: env.PINECONE_INDEX || 'not set',
  pineconeNamespaceEnv: env.PINECONE_NAMESPACE || 'not set',
};
console.log('ENV_STATUS', JSON.stringify(report));

const gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
let geminiModel = null;
for (const model of ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite']) {
  try {
    const response = await gemini.models.generateContent({ model, contents: 'Reply with only JSON {"ok":true}' });
    geminiModel = model;
    console.log('GEMINI_OK', JSON.stringify({ model, textLength: String(response?.text || '').length }));
    break;
  } catch (error) {
    console.log('GEMINI_ATTEMPT', JSON.stringify({ model, status: 'unavailable' }));
  }
}
if (!geminiModel) {
  console.log('GEMINI_OK', JSON.stringify({ model: 'none', status: 'blocked' }));
}

const pinecone = new Pinecone({ apiKey: env.PINECONE_API_KEY });
const list = await pinecone.listIndexes();
const indexNames = (list?.indexes || []).map((index) => index.name || 'unnamed');
console.log('PINECONE_INDEXES', JSON.stringify({ indexNames }));

const index = pinecone.index({ name: 'vani', namespace: 'financial_knowledge' });
const stats = await index.describeIndexStats();
console.log('PINECONE_STATS', JSON.stringify({
  namespaces: Object.keys(stats?.namespaces || {}),
  totalVectorCount: stats?.totalVectorCount || 0,
  dimension: stats?.dimension || 'unknown',
}));
const namespace = stats?.namespaces?.financial_knowledge;
console.log('PINECONE_NAMESPACE', JSON.stringify({
  recordCount: namespace?.recordCount || 0,
  vectorCount: namespace?.vectorCount || 0,
  keys: namespace ? Object.keys(namespace) : [],
}));

const embedModel = 'llama-text-embed-v2';
const embeddingResponse = await pinecone.inference.embed({
  model: embedModel,
  inputs: ['What is an EMI?'],
  parameters: { inputType: 'query' },
});
const embeddingValues = embeddingResponse?.data?.[0]?.values || embeddingResponse?.data?.[0]?.embedding || [];
console.log('PINECONE_EMBED', JSON.stringify({ model: embedModel, vectorLength: embeddingValues.length }));

const query = await index.query({
  vector: embeddingValues,
  topK: 5,
  includeMetadata: true,
  includeValues: false,
});
console.log('PINECONE_QUERY', JSON.stringify({
  matches: (query?.matches || []).map((match) => ({
    id: String(match.id),
    score: Number(match.score || 0),
    source: match.metadata?.source || match.metadata?.title || 'unknown',
  })),
}));

const appResponse = await fetch('http://localhost:3000/api/gemini/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'What is EMI?',
    language: 'English',
    history: [],
    financialContext: { currentBalance: 124580, safeToSpend: 42580 },
  }),
});
console.log('APP_ROUTE_STATUS', appResponse.status);
const appJson = await appResponse.json();
console.log('APP_ROUTE_REPLY', JSON.stringify({
  hasReplyText: Boolean(appJson?.replyText),
  replyTextPreview: String(appJson?.replyText || '').slice(0, 220),
  intentAction: appJson?.intentAction || null,
}));
