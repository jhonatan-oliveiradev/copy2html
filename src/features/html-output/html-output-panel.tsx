'use client'

import type { SerializationResult } from '@/core/serializer/serialize-editor-html'

type HtmlOutputPanelProps = {
  result: SerializationResult
}

export function HtmlOutputPanel({ result }: HtmlOutputPanelProps) {
  const status = result.validation.severity === 'valid' && result.sanitization.changed ? 'sanitized' : result.validation.severity
  const label = status === 'valid' ? 'HTML válido' : status === 'warning' ? 'Revisar avisos' : status === 'sanitized' ? 'Conteúdo sanitizado' : 'Correção necessária'

  return (
    <section className="output-panel" aria-labelledby="html-output-title">
      <div className="panel-heading-row">
        <div>
          <span className="eyebrow">Saída</span>
          <h2 id="html-output-title">HTML gerado</h2>
        </div>
        <span className={`status-badge status-${status}`}>{label}</span>
      </div>

      <pre className="html-code" tabIndex={0}><code>{result.html || '<!-- Comece colando sua copy no editor -->'}</code></pre>

      {result.sanitization.notices.length || result.validation.issues.length ? (
        <div className="validation-notices" role="status" aria-live="polite">
          {[...result.sanitization.notices, ...result.validation.issues.map((issue) => issue.message)].map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      ) : null}
    </section>
  )
}
