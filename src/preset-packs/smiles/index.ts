import { presetPackSchema, type PresetPack } from '@/core/presets/schemas'
import { smilesPresets } from './presets'

export const smilesPresetPack: PresetPack = presetPackSchema.parse({
  id: 'smiles',
  name: 'Smiles',
  description: 'Presets reutilizáveis para publicação de conteúdo Smiles no Liferay.',
  isDefault: true,
  previewTheme: {
    fontFamily: 'Nunito, Arial, Helvetica, sans-serif',
    fontStylesheetUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap',
  },
  presets: smilesPresets,
})
