import {
  SMILES_VISUAL_COLORS,
  structuredVisualCopySchema,
  type StructuredVisualCopy,
} from './structured-copy'

export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite'

function geminiEndpoint(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
}

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
            description: 'Consecutive text runs grouped only by real formatting changes, never by visual line wrapping.',
            items: {
              type: 'OBJECT',
              properties: {
                text: { type: 'STRING', description: 'Exact visible text, preserving punctuation, accents, emoji and natural spaces between words even across visual line wraps.' },
                bold: { type: 'BOOLEAN', description: 'True only when the text is visibly bold or semibold.' },
                italic: { type: 'BOOLEAN', description: 'True only when the text is visibly italic.' },
                color: {
                  type: 'STRING',
                  nullable: true,
                  enum: SMILES_VISUAL_COLORS,
                  description: 'Use only when the text color clearly matches one of the approved Smiles colors; otherwise null.',
                },
              },
              required: ['text', 'bold', 'italic', 'color'],
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
- preserve os espaços naturais entre palavras, inclusive quando duas palavras ficam em linhas visuais diferentes apenas por falta de largura;
- uma quebra visual de linha causada pelo tamanho da caixa NÃO é quebra de parágrafo, NÃO é quebra manual e NÃO cria um novo segmento;
- se duas partes consecutivas possuem exatamente a mesma combinação de bold, italic e color, mantenha-as no MESMO segmento mesmo que apareçam em linhas visuais diferentes;
- crie um novo segmento somente quando houver uma mudança real de formatação;
- preserve apenas negrito/semibold e itálico quando forem visualmente claros;
- para cor de texto, classifique somente quando houver correspondência visual clara com uma destas cores Smiles: ${SMILES_VISUAL_COLORS.join(', ')};
- se a cor não corresponder claramente à paleta permitida, retorne color como null;
- não invente links, URLs, estilos, HTML, CSS ou texto ausente;
- não descreva imagens, logos, botões ou elementos gráficos que não sejam texto de copy;
- quando um botão ou CTA tiver texto legível, transcreva apenas o texto;
- use um novo bloco somente para parágrafo, título, CTA ou trecho claramente separado semanticamente;
- mantenha bullets ou marcadores visíveis como parte do próprio texto;
- se houver dúvida sobre bold, italic ou color, prefira false/null.
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
  model = DEFAULT_GEMINI_MODEL,
): Promise<StructuredVisualCopy> {
  if (!apiKey.trim()) {
    throw new VisualExtractionError('A integração visual ainda não está configurada.', 'configuration')
  }

  const normalizedModel = model.trim() || DEFAULT_GEMINI_MODEL
  const imageBase64 = Buffer.from(await file.arrayBuffer()).toString('base64')
  const response = await fetch(geminiEndpoint(normalizedModel), {
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
