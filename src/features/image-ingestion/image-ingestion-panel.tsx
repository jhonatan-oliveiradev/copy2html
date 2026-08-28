'use client'

import Image from 'next/image'
import { ClipboardPaste, ImageIcon, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  formatImageFileSize,
  validateImageFile,
} from '@/core/image-ingestion/validate-image-file'

type ImageIngestionPanelProps = {
  onNotice: (message: string) => void
}

export function ImageIngestionPanel({ onNotice }: ImageIngestionPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

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
    onNotice('Imagem pronta para revisão. A extração visual será conectada na próxima etapa.')
  }, [onNotice])

  function removeFile() {
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
    onNotice('Imagem removida. Você pode enviar outra captura ou voltar ao editor de texto.')
  }

  return (
    <div className="image-ingestion-shell">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={(event) => receiveFile(event.target.files?.[0])}
      />

      {!file ? (
        <div
          className={`image-dropzone${dragging ? ' is-dragging' : ''}`}
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
          <div className="image-dropzone-icon" aria-hidden="true">
            <ImageIcon size={24} strokeWidth={1.7} />
          </div>
          <div className="image-dropzone-copy">
            <strong>Importe uma captura do Figma</strong>
            <p>Arraste uma imagem, clique para escolher ou cole uma screenshot com Ctrl+V.</p>
          </div>
          <div className="image-dropzone-actions" aria-hidden="true">
            <span><Upload size={14} /> Selecionar arquivo</span>
            <span><ClipboardPaste size={14} /> Colar screenshot</span>
          </div>
          <small>PNG, JPG ou WebP · até 12 MB · nada é enviado nesta etapa</small>
        </div>
      ) : (
        <div className="image-review-card">
          <div className="image-review-preview">
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

          <div className="image-review-meta">
            <div className="image-review-heading">
              <div>
                <span className="eyebrow">Imagem selecionada</span>
                <strong title={file.name}>{file.name}</strong>
              </div>
              <button type="button" className="image-remove-button" onClick={removeFile} aria-label="Remover imagem">
                <X size={16} />
              </button>
            </div>

            <div className="image-file-details">
              <span>{file.type.replace('image/', '').toUpperCase()}</span>
              <span>{formatImageFileSize(file.size)}</span>
              <span>Somente em memória</span>
            </div>

            <div className="image-analysis-state">
              <div>
                <span className="status-dot" aria-hidden="true" />
                <strong>Pronta para extração visual</strong>
              </div>
              <p>Na próxima etapa, o Copy2HTML vai identificar texto, negritos, hierarquia e quebras antes de levar o conteúdo ao editor.</p>
            </div>

            <div className="image-review-actions">
              <Button variant="outline" onClick={() => inputRef.current?.click()}>Trocar imagem</Button>
              <Button disabled>Extrair conteúdo</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
