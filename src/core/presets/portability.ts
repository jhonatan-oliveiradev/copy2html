import { z } from 'zod'
import { presetSchema, type Preset } from './schemas'

export const PORTABLE_PRESET_PACK_FORMAT = 'copy2html-preset-pack' as const
export const PORTABLE_PRESET_PACK_VERSION = 1 as const

const portablePresetPackSchema = z.object({
  format: z.literal(PORTABLE_PRESET_PACK_FORMAT),
  version: z.literal(PORTABLE_PRESET_PACK_VERSION),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  author: z.string().trim().max(120).optional(),
  exportedAt: z.iso.datetime(),
  presets: z.array(presetSchema).max(500),
})

export type PortablePresetPack = z.output<typeof portablePresetPackSchema>
export type ImportConflictStrategy = 'keep-existing' | 'replace-existing'

export type CreatePortablePresetPackOptions = {
  name: string
  description?: string
  author?: string
  exportedAt?: string
}

export type ParsePortablePresetPackResult =
  | { success: true; data: PortablePresetPack }
  | { success: false; error: string }

export type MergeImportedPresetsResult = {
  presets: Preset[]
  imported: number
  conflicts: number
  blockedOfficial: number
}

export function createPortablePresetPack(
  presets: Preset[],
  options: CreatePortablePresetPackOptions,
): PortablePresetPack {
  return portablePresetPackSchema.parse({
    format: PORTABLE_PRESET_PACK_FORMAT,
    version: PORTABLE_PRESET_PACK_VERSION,
    name: options.name,
    description: options.description,
    author: options.author,
    exportedAt: options.exportedAt ?? new Date().toISOString(),
    presets,
  })
}

export function serializePortablePresetPack(pack: PortablePresetPack): string {
  return `${JSON.stringify(portablePresetPackSchema.parse(pack), null, 2)}\n`
}

export function parsePortablePresetPack(raw: string): ParsePortablePresetPackResult {
  try {
    const json: unknown = JSON.parse(raw)
    const parsed = portablePresetPackSchema.safeParse(json)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Arquivo de presets inválido, incompatível ou com conteúdo não permitido.',
      }
    }
    return { success: true, data: parsed.data }
  } catch {
    return { success: false, error: 'Não foi possível ler o arquivo de presets.' }
  }
}

export function mergeImportedPresets(
  existing: Preset[],
  incoming: Preset[],
  strategy: ImportConflictStrategy,
  officialPresetIds: ReadonlySet<string> = new Set(),
): MergeImportedPresetsResult {
  const validatedExisting = z.array(presetSchema).parse(existing)
  const validatedIncoming = z.array(presetSchema).parse(incoming)
  const byId = new Map(validatedExisting.map((preset) => [preset.id, preset]))
  let imported = 0
  let conflicts = 0
  let blockedOfficial = 0

  for (const preset of validatedIncoming) {
    if (officialPresetIds.has(preset.id)) {
      blockedOfficial += 1
      continue
    }

    const exists = byId.has(preset.id)
    if (exists) {
      conflicts += 1
      if (strategy === 'keep-existing') continue
    }

    byId.set(preset.id, preset)
    imported += 1
  }

  return {
    presets: [...byId.values()],
    imported,
    conflicts,
    blockedOfficial,
  }
}

export function portablePresetFilename(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return `${slug || 'presets'}.copy2html.json`
}
