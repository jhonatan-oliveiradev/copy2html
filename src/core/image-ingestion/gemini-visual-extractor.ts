import { structuredVisualCopySchema, type StructuredVisualCopy } from './structured-copy'

const GEMINI_MODEL = 'gemini-2.5-flash-lite'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const responseSchema = {
  type: 'OBJECT',
  properties: {
    blocks: {
      type: 'ARRAY',
      description: 'Semantic text blocks in reading order. Do not split a paragraph only because it wraps visually.',
      items: {
        type: 'OBJECT',
        properties: {
          segments: {
            type: 'ARRAY',
            description: 'Consecutive text runs with only visually evident formatting.',
            items: {
              type: 'OBJECT',
              properties: {
                text: { type: 'STRING', description: 'Exact visible text, preserving punctuation, accents and emoji.' },
                bold: { type: 'BOOLEAN', description: 'True only when the text is visibly bold or semibold.' },
                italic: { type: 'BOOLEAN', description: 'True only when the text is visibly italic.' },
              },
              required: ['text', 'bold', 'italic'],
            },
          },
        },
        required: ['segments'],
      },
    },
  },
  required: ['blocks'],
} as const

const prompt = `
Transcreva a copy visível nesta arte de campanha para uma estrutura de texto editável.

Regras obrigatórias:
- siga a ordem natural de leitura;
- copie o texto exatamente como aparece, incluindo acentos, pontuação, números e emojis;
- preserve apenas negrito/semibold e itálico quando forem visualmente claros;
- não invente links, URLs, estilos, HTML, CSS ou texto ausente;
- não descreva imagens, logos, botões ou elementos gráficos que não sejam texto de copy;
- quando um botão ou CTA tiver texto legível, transcreva apenas o texto;
- não crie um novo bloco só porque uma linha quebrou visualmente por largura; use um novo bloco para parágrafo, título, CTA ou trecho claramente separado;
- mantenha bullets ou marcadores visíveis como parte do próprio texto;
- se houver dúvida sobre bold/italic, prefira false.
`.trim()

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
  error?: { message?: string }
}

export class VisualExtractionError extends Error {
  constructor(
    message: string,
    readonly code: 'configuration' | 'provider' | 'invalid-response',
  ) {
    super(message)
    this.name = 'VisualExtractionError'
  }
}

export async function extractVisualCopyWithGemini(
  file: File,
  apiKey: string,
): Promise<StructuredVisualCopy> {
  if (!apiKey.trim()) {
    throw new VisualExtractionError('A integração visual ainda não está configurada.', 'configuration')
  }

  const imageBase64 = Buffer.from(await file.arrayBuffer()).toString('base64')
  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: imageBase64,
              },
            },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema,
      },
    }),
    signal: AbortSignal.timeout(45_000),
  })

  const payload = (await response.json().catch(() => ({}))) as GeminiResponse
  if (!response.ok) {
    throw new VisualExtractionError(
      payload.error?.message || 'O Gemini não conseguiu processar a imagem.',
      'provider',
    )
  }

  const text = payload.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text
  if (!text) {
    throw new VisualExtractionError('O Gemini não retornou conteúdo estruturado.', 'invalid-response')
  }

  try {
    return structuredVisualCopySchema.parse(JSON.parse(text))
  } catch {
    throw new VisualExtractionError('A resposta visual não passou pela validação do Copy2HTML.', 'invalid-response')
  }
}
