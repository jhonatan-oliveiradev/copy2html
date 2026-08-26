import { presetPackSchema, type PresetPack } from '@/core/presets/schemas'

export const basePresetPack: PresetPack = presetPackSchema.parse({
  id: 'base',
  name: 'Base',
  description: 'Formatações HTML genéricas do Copy2HTML.',
  isDefault: false,
  presets: [
    {
      id: 'strong',
      label: 'Negrito',
      type: 'formatting',
      template: '<strong>{{selection}}</strong>',
    },
    {
      id: 'small',
      label: 'Observação / Small',
      type: 'formatting',
      template: '<small>{{selection}}</small>',
    },
    {
      id: 'single-break',
      label: 'Quebra simples',
      type: 'insertion',
      value: '<br />',
    },
    {
      id: 'double-break',
      label: 'Quebra dupla',
      type: 'insertion',
      value: '<br /><br />',
    },
    {
      id: 'nbsp',
      label: 'Espaço não quebrável',
      type: 'insertion',
      value: '&nbsp;',
    },
  ],
})
