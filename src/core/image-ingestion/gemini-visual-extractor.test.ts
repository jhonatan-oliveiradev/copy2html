import { afterEach, describe, expect, it, vi } from 'vitest'
import { extractVisualCopyWithGemini, VisualExtractionError } from './gemini-visual-extractor'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('extractVisualCopyWithGemini', () => {
  it('sends the image server-side and validates structured output', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      blocks: [
                        {
                          segments: [{ text: 'Oferta', bold: true, italic: false }],
                        },
                      ],
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const file = new File([new Uint8Array([1, 2, 3])], 'campaign.png', { type: 'image/png' })
    const result = await extractVisualCopyWithGemini(file, 'server-secret')

    expect(result.blocks[0]?.segments[0]?.text).toBe('Oferta')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('server-secret')
    const body = JSON.parse(String(init.body))
    expect(body.contents[0].parts[0].inlineData.mimeType).toBe('image/png')
    expect(body.generationConfig.responseMimeType).toBe('application/json')
  })

  it('blocks malformed model output', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"blocks":[]}' }] } }] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    )

    const file = new File([new Uint8Array([1])], 'campaign.png', { type: 'image/png' })

    await expect(extractVisualCopyWithGemini(file, 'server-secret')).rejects.toMatchObject<Partial<VisualExtractionError>>({
      code: 'invalid-response',
    })
  })
})
