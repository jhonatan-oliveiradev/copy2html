'use client'

import { FormEvent, useState } from 'react'
import { formattingPresetSchema, type FormattingPreset } from '@/core/presets/schemas'

type CustomPresetFormProps = {
  onCreate: (preset: FormattingPreset) => void
  onError: (message: string) => void
}

export function CustomPresetForm({ onCreate, onError }: CustomPresetFormProps) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [color, setColor] = useState('#663399')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const id = `custom-${label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
    const parsed = formattingPresetSchema.safeParse({
      id,
      label,
      type: 'formatting',
      reviewBeforeUse: false,
      template: `<strong style="color: ${color}; display: inline-block">{{selection}}</strong>`,
    })

    if (!parsed.success) {
      onError('Não foi possível criar o preset. Revise o nome e a cor informados.')
      return
    }

    onCreate(parsed.data)
    setLabel('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button type="button" className="secondary-button full-width" onClick={() => setOpen(true)}>
        + Criar preset pessoal
      </button>
    )
  }

  return (
    <form className="custom-preset-form" onSubmit={submit}>
      <label>
        Nome
        <input value={label} onChange={(event) => setLabel(event.target.value)} required maxLength={50} />
      </label>
      <label>
        Cor do destaque
        <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
      </label>
      <div className="inline-actions">
        <button type="submit" className="primary-button">Salvar</button>
        <button type="button" className="ghost-button" onClick={() => setOpen(false)}>Cancelar</button>
      </div>
    </form>
  )
}
