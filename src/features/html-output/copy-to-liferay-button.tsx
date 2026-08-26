'use client'

import { useState } from 'react'
import type { SerializationResult } from '@/core/serializer/serialize-editor-html'

type CopyToLiferayButtonProps = {
  result: SerializationResult
  onNotice: (message: string) => void
}

export function CopyToLiferayButton({ result, onNotice }: CopyToLiferayButtonProps) {
  const [copied, setCopied] = useState(false)
  const blocked = result.validation.severity === 'blocked' || !result.html.trim()

  async function copy() {
    if (blocked) {
      onNotice('Corrija os itens bloqueantes antes de copiar para o Liferay.')
      return
    }

    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(result.sanitization.html)
      setCopied(true)
      onNotice('HTML sanitizado copiado. Já pode colar no módulo Liferay.')
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      onNotice('O navegador bloqueou a cópia automática. Selecione o HTML gerado e copie manualmente.')
    }
  }

  return (
    <button type="button" className="copy-button" disabled={blocked} onClick={copy} aria-live="polite">
      {copied ? 'Copiado!' : 'Copiar para Liferay'}
    </button>
  )
}
