import { NextResponse } from 'next/server'
import { validateImageFile } from '@/core/image-ingestion/validate-image-file'
import {
  extractVisualCopyWithGemini,
  VisualExtractionError,
} from '@/core/image-ingestion/gemini-visual-extractor'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('image')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Envie uma imagem para extrair o conteúdo.' }, { status: 400 })
    }

    const validation = validateImageFile(file)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY ?? ''
    const copy = await extractVisualCopyWithGemini(file, apiKey)
    return NextResponse.json({ copy })
  } catch (error) {
    if (error instanceof VisualExtractionError) {
      const status = error.code === 'configuration' ? 503 : 502
      return NextResponse.json({ error: error.message }, { status })
    }

    return NextResponse.json(
      { error: 'Não foi possível extrair o conteúdo da imagem agora. Tente novamente.' },
      { status: 500 },
    )
  }
}
