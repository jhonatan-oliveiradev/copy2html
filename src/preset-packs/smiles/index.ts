import { presetPackSchema, type PresetPack } from '@/core/presets/schemas'
import { smilesPresets } from './presets'

export const smilesPresetPack: PresetPack = presetPackSchema.parse({
  id: 'smiles',
  name: 'Smiles',
  description: 'Presets reutilizáveis para publicação de conteúdo Smiles no Liferay.',
  isDefault: true,
  presets: smilesPresets,
})
