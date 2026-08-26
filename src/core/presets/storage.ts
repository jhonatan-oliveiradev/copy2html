import { z } from 'zod'
import { presetSchema, type Preset } from './schemas'

const STORAGE_KEY = 'copy2html:custom-presets:v1'
const customPresetListSchema = z.array(presetSchema)
let memoryFallback: Preset[] = []

function storage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    const probe = '__copy2html_storage_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    return null
  }
}

export type LoadCustomPresetsResult = {
  presets: Preset[]
  persistent: boolean
  notice?: string
}

export function loadCustomPresets(): LoadCustomPresetsResult {
  const target = storage()
  if (!target) {
    return {
      presets: [...memoryFallback],
      persistent: false,
      notice: 'O armazenamento local não está disponível; presets personalizados durarão apenas nesta sessão.',
    }
  }

  const raw = target.getItem(STORAGE_KEY)
  if (!raw) return { presets: [], persistent: true }

  try {
    const parsed = customPresetListSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      return { presets: [], persistent: true, notice: 'Presets locais inválidos foram ignorados com segurança.' }
    }
    return { presets: parsed.data, persistent: true }
  } catch {
    return { presets: [], persistent: true, notice: 'Não foi possível ler os presets locais; o conteúdo corrompido foi ignorado.' }
  }
}

export function saveCustomPresets(presets: Preset[]): LoadCustomPresetsResult {
  const validated = customPresetListSchema.parse(presets)
  const target = storage()

  if (!target) {
    memoryFallback = [...validated]
    return {
      presets: [...validated],
      persistent: false,
      notice: 'O armazenamento local não está disponível; presets personalizados durarão apenas nesta sessão.',
    }
  }

  target.setItem(STORAGE_KEY, JSON.stringify(validated))
  return { presets: validated, persistent: true }
}
