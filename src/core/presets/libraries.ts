import { z } from 'zod'
import { presetSchema, type Preset } from './schemas'

const STORAGE_KEY = 'copy2html:preset-libraries:v1'

const presetLibrarySchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  author: z.string().trim().max(120).optional(),
  sourcePackId: z.string().min(1).optional(),
  importedAt: z.iso.datetime(),
  presets: z.array(presetSchema).max(500),
})

const presetLibraryListSchema = z.array(presetLibrarySchema).max(100)

export type PresetLibrary = z.output<typeof presetLibrarySchema>

let memoryFallback: PresetLibrary[] = []

function storage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    const probe = '__copy2html_library_storage_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    return null
  }
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function createPresetLibrary(input: {
  name: string
  description?: string
  author?: string
  sourcePackId?: string
  exportedAt?: string
  presets: Preset[]
}): PresetLibrary {
  const timestamp = (input.exportedAt ?? new Date().toISOString()).replace(/\D/g, '').slice(0, 14)
  return presetLibrarySchema.parse({
    id: `imported-${slugify(input.name) || 'pack'}-${timestamp}`,
    name: input.name,
    description: input.description,
    author: input.author,
    sourcePackId: input.sourcePackId,
    importedAt: new Date().toISOString(),
    presets: input.presets,
  })
}

export function loadPresetLibraries(): { libraries: PresetLibrary[]; persistent: boolean; notice?: string } {
  const target = storage()
  if (!target) {
    return {
      libraries: [...memoryFallback],
      persistent: false,
      notice: 'Bibliotecas importadas durarão apenas nesta sessão porque o armazenamento local não está disponível.',
    }
  }

  const raw = target.getItem(STORAGE_KEY)
  if (!raw) return { libraries: [], persistent: true }

  try {
    const parsed = presetLibraryListSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      return { libraries: [], persistent: true, notice: 'Bibliotecas locais inválidas foram ignoradas com segurança.' }
    }
    return { libraries: parsed.data, persistent: true }
  } catch {
    return { libraries: [], persistent: true, notice: 'Não foi possível ler as bibliotecas locais; dados corrompidos foram ignorados.' }
  }
}

export function savePresetLibraries(libraries: PresetLibrary[]) {
  const validated = presetLibraryListSchema.parse(libraries)
  const target = storage()

  if (!target) {
    memoryFallback = [...validated]
    return { libraries: [...validated], persistent: false }
  }

  target.setItem(STORAGE_KEY, JSON.stringify(validated))
  return { libraries: validated, persistent: true }
}
