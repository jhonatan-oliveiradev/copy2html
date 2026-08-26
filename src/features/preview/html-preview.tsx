'use client'

import type { SerializationResult } from '@/core/serializer/serialize-editor-html'

type HtmlPreviewProps = {
  result: SerializationResult
}

export function HtmlPreview({ result }: HtmlPreviewProps) {
  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,Helvetica,sans-serif;color:#4b4b4b;line-height:1.5;padding:20px;margin:0}a{cursor:pointer}p{margin:0 0 16px}strong{font-weight:700}</style></head><body>${result.sanitization.html || '<p style="color:#888">O preview aparecerá aqui.</p>'}</body></html>`

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
