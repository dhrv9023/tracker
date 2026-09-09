// ==========================================================================
// VERCEL SERVERLESS FUNCTION — SECURE GEMINI PROXY
// Reads process.env.GEMINI_API_KEY strictly on Vercel's server runtime.
// The API key is NEVER sent to the browser or bundled in client assets.
// ==========================================================================

import type { IncomingMessage, ServerResponse } from 'http';

interface GeminiRequestBody {
  model?: string;
  contents: any;
  config?: any;
}

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== 'POST') {
    if (typeof res.status === 'function') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
  }

  // Server-side secret key (configured in Vercel Environment Variables)
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    const errorPayload = {
      error: 'NO_SERVER_KEY',
      message: 'GEMINI_API_KEY environment variable is not configured on the server.',
    };
    if (typeof res.status === 'function') {
      return res.status(401).json(errorPayload);
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(errorPayload));
    }
  }

  // Parse request body
  let body: GeminiRequestBody;
  if (req.body && typeof req.body === 'object') {
    body = req.body;
  } else if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body);
    } catch {
      body = { contents: '' };
    }
  } else {
    // If body stream needs collection
    try {
      const chunks: Uint8Array[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      body = JSON.parse(Buffer.concat(chunks).toString('utf-8') || '{}');
    } catch {
      body = { contents: '' };
    }
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const model = body.model || 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model,
      contents: body.contents,
      config: body.config,
    });

    const outputText = response?.text || '';

    if (typeof res.status === 'function') {
      return res.status(200).json({ text: outputText });
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ text: outputText }));
    }
  } catch (err: any) {
    console.error('Gemini API Execution Error:', err);
    const errPayload = {
      error: 'GEMINI_EXECUTION_ERROR',
      message: err?.message || 'Failed to generate content from Gemini',
    };
    if (typeof res.status === 'function') {
      return res.status(500).json(errPayload);
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(errPayload));
    }
  }
}
