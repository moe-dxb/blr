"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiGenerate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const vertexai_1 = require("@google-cloud/vertexai");
const db = admin.firestore();
function assertAuth(context) {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Auth required');
}
// Pricing approximations for Gemini 2.0 Flash (USD per 1M tokens)
// Input: $0.10, Output: $0.40
const PRICE_PER_INPUT_TOKEN_USD = 0.10 / 1000000; // 0.0000001
const PRICE_PER_OUTPUT_TOKEN_USD = 0.40 / 1000000; // 0.0000004
const MONTHLY_CAP_USD = 100; // Cap to $100
/**
 * Returns the Firestore usage doc ref for the current month.
 */
function usageDocRef() {
    const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
    return db.collection('_usage').doc(monthKey);
}
function toCents(usd) {
    return Math.round(usd * 100);
}
exports.aiGenerate = functions.https.onCall(async (data, context) => {
    assertAuth(context);
    const { prompt, maxOutputTokens = 300, temperature = 0.7, model = 'gemini-2.0-flash' } = data;
    if (!prompt || typeof prompt !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Valid prompt is required');
    }
    // Enforce safe limits
    const cappedMaxTokens = Math.max(1, Math.min(1000, Math.floor(maxOutputTokens)));
    const cappedTemp = Math.min(1.5, Math.max(0, Number(temperature) || 0.7));
    // Check monthly usage cap
    const ref = usageDocRef();
    const snap = await ref.get();
    const spentCents = (snap.exists ? snap.data().spentCents : 0) || 0;
    if (spentCents >= toCents(MONTHLY_CAP_USD)) {
        throw new functions.https.HttpsError('resource-exhausted', 'Monthly AI budget exhausted');
    }
    // Init Vertex AI with ADC
    const project = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || process.env.PROJECT_ID;
    const location = process.env.GCLOUD_LOCATION || 'us-central1';
    const vertex = new vertexai_1.VertexAI({ project: project, location });
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
    const text = response?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    // Usage metadata (best-effort; fields vary by version)
    const usage = response?.usageMetadata || result?.usageMetadata || {};
    const inputTokens = usage.promptTokenCount || usage.inputTokenCount || 0;
    const outputTokens = usage.candidatesTokenCount || usage.outputTokenCount || cappedMaxTokens; // fallback conservative
    const totalTokens = usage.totalTokenCount || inputTokens + outputTokens;
    // Cost estimation and update
    const estimatedUsd = inputTokens * PRICE_PER_INPUT_TOKEN_USD + outputTokens * PRICE_PER_OUTPUT_TOKEN_USD;
    const estimatedCents = toCents(estimatedUsd);
    await ref.set({
        spentCents: admin.firestore.FieldValue.increment(estimatedCents),
        inputTokens: admin.firestore.FieldValue.increment(inputTokens || 0),
        outputTokens: admin.firestore.FieldValue.increment(outputTokens || 0),
        totalTokens: admin.firestore.FieldValue.increment(totalTokens || 0),
        requests: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
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
//# sourceMappingURL=ai.js.map