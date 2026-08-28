'use client'

import Image from 'next/image'
import { ClipboardPaste, ImageIcon, Loader2, Sparkles, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  structuredVisualCopySchema,
  structuredVisualCopyToEditorHtml,
} from '@/core/image-ingestion/structured-copy'
import {
  formatImageFileSize,
  validateImageFile,
} from '@/core/image-ingestion/validate-image-file'
import styles from './image-ingestion-panel.module.css'

type ImageIngestionPanelProps = {
  onNotice: (message: string) => void
  onExtracted: (html: string) => boolean
}

type ExtractionResponse = {
  copy?: unknown
  error?: string
  code?: string
}

export function ImageIngestionPanel({ onNotice, onExtracted }: ImageIngestionPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const receiveFile = useCallback((candidate: File | undefined) => {
    if (!candidate) return
    const validation = validateImageFile(candidate)
    if (!validation.success) {
      onNotice(validation.error)
      return
    }

    setFile(candidate)
    setExtractionError(null)
    onNotice('Imagem pronta. Revise o preview e clique em Extrair.')
  }, [onNotice])

  function removeFile() {
    setFile(null)
    setExtractionError(null)
    if (inputRef.current) inputRef.current.value = ''
    onNotice('Imagem removida. Você pode enviar outra captura ou voltar ao editor de texto.')
  }

  async function extractContent() {
    if (!file || extracting) return

    setExtracting(true)
    setExtractionError(null)
    onNotice('Analisando texto e formatação visual da imagem…')

    try {
      const formData = new FormData()
      formData.set('image', file)
      const response = await fetch('/api/extract-visual-copy', {
        method: 'POST',
        body: formData,
      })
      const payload = (await response.json().catch(() => ({}))) as ExtractionResponse

      if (!response.ok) {
        const message = payload.code === 'gemini-not-configured'
          ? 'Gemini não configurado neste deployment. Faça um novo deploy após adicionar GEMINI_API_KEY na Vercel.'
          : payload.error || 'Não foi possível processar a imagem.'
        setExtractionError(message)
        throw new Error(message)
      }

      const parsed = structuredVisualCopySchema.safeParse(payload.copy)
      if (!parsed.success) {
        throw new Error('A extração retornou um formato inesperado e foi bloqueada por segurança.')
      }

      const html = structuredVisualCopyToEditorHtml(parsed.data)
      if (!onExtracted(html)) {
        throw new Error('O editor ainda está inicializando. Tente novamente em alguns segundos.')
      }

      onNotice(`Conteúdo extraído em ${parsed.data.blocks.length} bloco${parsed.data.blocks.length === 1 ? '' : 's'}. Revise o resultado antes de copiar para o Liferay.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível extrair o conteúdo da imagem.'
      setExtractionError((current) => current ?? message)
      onNotice(message)
    } finally {
      setExtracting(false)
    }
  }

  return (
    <div className={styles.shell}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={(event) => receiveFile(event.target.files?.[0])}
      />

      {!file ? (
        <div
          className={`${styles.dropzone}${dragging ? ` ${styles.dragging}` : ''}`}
          tabIndex={0}
          role="button"
          aria-label="Importar screenshot ou export do Figma"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
          }}
          onDragEnter={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            if (event.currentTarget === event.target) setDragging(false)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            receiveFile(event.dataTransfer.files?.[0])
          }}
          onPaste={(event) => {
            const pastedImage = [...event.clipboardData.files].find((item) => item.type.startsWith('image/'))
            if (pastedImage) {
              event.preventDefault()
              receiveFile(pastedImage)
            }
          }}
        >
          <div className={styles.icon} aria-hidden="true">
            <ImageIcon size={24} strokeWidth={1.7} />
          </div>
          <div className={styles.copy}>
            <strong>Importe uma captura do Figma</strong>
            <p>Arraste uma imagem, clique para escolher ou cole uma screenshot com Ctrl+V.</p>
          </div>
          <div className={styles.actionsHint} aria-hidden="true">
            <span><Upload size={14} /> Selecionar arquivo</span>
            <span><ClipboardPaste size={14} /> Colar screenshot</span>
          </div>
          <small>PNG, JPG ou WebP · até 12 MB</small>
        </div>
      ) : (
        <div className={styles.reviewCard}>
          <div className={styles.preview}>
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Preview da imagem importada"
                fill
                unoptimized
                sizes="(max-width: 980px) 100vw, 70vw"
              />
            ) : null}
          </div>

          <div className={styles.meta}>
            <div className={styles.heading}>
              <div>
                <span className="eyebrow">Imagem selecionada</span>
                <strong title={file.name}>{file.name}</strong>
              </div>
              <button type="button" className={styles.remove} onClick={removeFile} aria-label="Remover imagem" disabled={extracting}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.fileDetails}>
              <span>{file.type.replace('image/', '').toUpperCase()}</span>
              <span>{formatImageFileSize(file.size)}</span>
              <span>Preview local</span>
            </div>

            <div className={styles.analysis}>
              <div>
                <span className={styles.statusDot} aria-hidden="true" />
                <strong>{extracting ? 'Extraindo conteúdo…' : extractionError ? 'Extração indisponível' : 'Pronta para extração visual'}</strong>
              </div>
              {extractionError ? (
                <p role="alert">{extractionError}</p>
              ) : (
                <>
                  <p>
                    O Gemini identifica texto, negritos, itálicos e blocos. O resultado é validado pelo Copy2HTML e sempre volta ao editor para revisão.
                  </p>
                  <small>Ao extrair, esta imagem é enviada à Gemini API para análise.</small>
                </>
              )}
            </div>

            <div className={styles.reviewActions}>
              <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={extracting}>Trocar imagem</Button>
              <Button onClick={() => void extractContent()} disabled={extracting}>
                {extracting ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {extracting ? 'Extraindo…' : 'Extrair'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
