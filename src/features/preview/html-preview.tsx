'use client'

import type { PreviewTheme } from '@/core/presets/schemas'
import type { SerializationResult } from '@/core/serializer/serialize-editor-html'

type HtmlPreviewProps = {
  result: SerializationResult
  previewTheme?: PreviewTheme
}

function escapeAttribute(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

export function HtmlPreview({ result, previewTheme }: HtmlPreviewProps) {
  const fontFamily = previewTheme?.fontFamily ?? 'Arial, Helvetica, sans-serif'
  const fontStylesheet = previewTheme?.fontStylesheetUrl
    ? `<link rel="stylesheet" href="${escapeAttribute(previewTheme.fontStylesheetUrl)}">`
    : ''
  const srcDoc = `<!doctype html><html><head><meta charset="utf-8">${fontStylesheet}<style>body{font-family:${fontFamily};color:#4b4b4b;line-height:1.5;padding:20px;margin:0}a{cursor:pointer}p{margin:0 0 16px}strong{font-weight:700}</style></head><body>${result.sanitization.html || '<p style="color:#888">O preview aparecerá aqui.</p>'}</body></html>`

  return (
    <section className="preview-panel" aria-labelledby="preview-title">
      <div className="panel-heading-row">
        <div>
          <span className="eyebrow">Renderização</span>
          <h2 id="preview-title">Preview</h2>
        </div>
      </div>
      <iframe title="Preview do HTML sanitizado" sandbox="" srcDoc={srcDoc} className="preview-frame" />
    </section>
  )
}
