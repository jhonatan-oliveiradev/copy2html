import type { PresetPack } from './schemas'
import { basePresetPack } from '@/preset-packs/base'
import { smilesPresetPack } from '@/preset-packs/smiles'

const officialPresetPacks: PresetPack[] = [basePresetPack, smilesPresetPack]

export function listPresetPacks(): PresetPack[] {
  return officialPresetPacks.map((pack) => ({ ...pack, presets: [...pack.presets] }))
}

export function getPresetPack(id: string): PresetPack | undefined {
  const pack = officialPresetPacks.find((candidate) => candidate.id === id)
  return pack ? { ...pack, presets: [...pack.presets] } : undefined
}

export function getDefaultPresetPack(): PresetPack {
  const pack = officialPresetPacks.find((candidate) => candidate.isDefault)
  if (!pack) {
    throw new Error('No default preset pack configured')
  }
  return { ...pack, presets: [...pack.presets] }
}
