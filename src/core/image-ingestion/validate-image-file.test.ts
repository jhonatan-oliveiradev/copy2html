import { describe, expect, it } from 'vitest'
import { IMAGE_INGESTION_MAX_BYTES, validateImageFile } from './validate-image-file'

describe('validateImageFile', () => {
  it('accepts supported image types', () => {
    const file = new File(['image'], 'figma.png', { type: 'image/png' })
    expect(validateImageFile(file)).toEqual({ success: true })
  })

  it('rejects unsupported formats', () => {
    const file = new File(['svg'], 'layout.svg', { type: 'image/svg+xml' })
    expect(validateImageFile(file)).toEqual({ success: false, error: 'Use uma imagem PNG, JPG ou WebP.' })
  })

  it('rejects images above the size limit', () => {
    const file = new File([new Uint8Array(IMAGE_INGESTION_MAX_BYTES + 1)], 'large.png', { type: 'image/png' })
    expect(validateImageFile(file)).toEqual({ success: false, error: 'A imagem ultrapassa o limite de 12 MB.' })
  })
})
