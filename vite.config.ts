import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

function geminiProxyPlugin(): Plugin {
  return {
    name: 'gemini-proxy-middleware',
    configureServer(server) {
      server.middlewares.use('/api/gemini', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            let apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
              const apiTxtPath = path.resolve(process.cwd(), 'api.txt');
              if (fs.existsSync(apiTxtPath)) {
                apiKey = fs.readFileSync(apiTxtPath, 'utf8').trim();
              }
            }

            if (!apiKey) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'NO_SERVER_KEY', message: 'No server-side Gemini key configured.' }));
              return;
            }

            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey });
            const payload = JSON.parse(body || '{}');

            const response = await ai.models.generateContent({
              model: payload.model || 'gemini-3.6-flash',
              contents: payload.contents,
              config: payload.config,
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text: response.text }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Gemini proxy error' }));
          }
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), geminiProxyPlugin()],
})
