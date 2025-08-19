import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';

const db = admin.firestore();

function assertAuth(context: functions.https.CallableContext) {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Auth required');
}

// Pricing approximations for Gemini 2.0 Flash (USD per 1M tokens)
// Input: $0.10, Output: $0.40
const PRICE_PER_INPUT_TOKEN_USD = 0.10 / 1_000_000; // 0.0000001
const PRICE_PER_OUTPUT_TOKEN_USD = 0.40 / 1_000_000; // 0.0000004
const MONTHLY_CAP_USD = 100; // Cap to $100

/**
 * Returns the Firestore usage doc ref for the current month.
 */
function usageDocRef() {
  const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
  return db.collection('_usage').doc(monthKey);
}

function toCents(usd: number) {
  return Math.round(usd * 100);
}

export const aiGenerate = functions.https.onCall(async (data, context) => {
  assertAuth(context);
  const { prompt, maxOutputTokens = 300, temperature = 0.7, model = 'gemini-2.0-flash' } = data as {
    prompt: string;
    maxOutputTokens?: number;
    temperature?: number;
    model?: string;
  };

  if (!prompt || typeof prompt !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid prompt is required');
  }

  // Enforce safe limits
  const cappedMaxTokens = Math.max(1, Math.min(1000, Math.floor(maxOutputTokens)));
  const cappedTemp = Math.min(1.5, Math.max(0, Number(temperature) || 0.7));

  // Check monthly usage cap
  const ref = usageDocRef();
  const snap = await ref.get();
  const spentCents = (snap.exists ? (snap.data() as any).spentCents : 0) || 0;
  if (spentCents >= toCents(MONTHLY_CAP_USD)) {
    throw new functions.https.HttpsError('resource-exhausted', 'Monthly AI budget exhausted');
  }

  // Init Vertex AI with ADC
  const project = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || process.env.PROJECT_ID;
  const location = process.env.GCLOUD_LOCATION || 'us-central1';
  const vertex = new VertexAI({ project: project as string, location });

  // Text generation via Vertex (Generative Model)
  const generativeModel = vertex.getGenerativeModel({
    model,
    generationConfig: {
      maxOutputTokens: cappedMaxTokens,
      temperature: cappedTemp,
    },
  });

  const result = await generativeModel.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
  const response = result.response;
  const text = response?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '';

  // Usage metadata (best-effort; fields vary by version)
  const usage = (response as any)?.usageMetadata || (result as any)?.usageMetadata || {};
  const inputTokens: number = usage.promptTokenCount || usage.inputTokenCount || 0;
  const outputTokens: number = usage.candidatesTokenCount || usage.outputTokenCount || cappedMaxTokens; // fallback conservative
  const totalTokens = (usage.totalTokenCount as number) || inputTokens + outputTokens;

  // Cost estimation and update
  const estimatedUsd = inputTokens * PRICE_PER_INPUT_TOKEN_USD + outputTokens * PRICE_PER_OUTPUT_TOKEN_USD;
  const estimatedCents = toCents(estimatedUsd);

  await ref.set(
    {
      spentCents: admin.firestore.FieldValue.increment(estimatedCents),
      inputTokens: admin.firestore.FieldValue.increment(inputTokens || 0),
      outputTokens: admin.firestore.FieldValue.increment(outputTokens || 0),
      totalTokens: admin.firestore.FieldValue.increment(totalTokens || 0),
      requests: admin.firestore.FieldValue.increment(1),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return {
    text,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCents,
      model,
      location,
    },
  };
});