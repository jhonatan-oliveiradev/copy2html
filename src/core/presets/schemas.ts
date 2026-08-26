import { z } from 'zod'

const safeTemplate = z
  .string()
  .min(1)
  .refine((value) => !/<script\b/i.test(value), 'Scripts are not allowed in preset templates')
  .refine((value) => !/\son\w+\s*=/i.test(value), 'Event handlers are not allowed in preset templates')
  .refine((value) => !/javascript\s*:/i.test(value), 'Unsafe URL schemes are not allowed')

const basePresetSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  label: z.string().min(1),
  description: z.string().optional(),
  reviewBeforeUse: z.boolean().default(false),
})

export const formattingPresetSchema = basePresetSchema.extend({
  type: z.literal('formatting'),
  template: safeTemplate.refine((value) => value.includes('{{selection}}'), 'Formatting templates require {{selection}}'),
})

export const linkPresetSchema = basePresetSchema.extend({
  type: z.literal('link'),
  href: z.string().min(1),
  template: safeTemplate
    .refine((value) => value.includes('{{selection}}'), 'Link templates require {{selection}}')
    .refine((value) => value.includes('{{href}}'), 'Link templates require {{href}}'),
})

export const insertionPresetSchema = basePresetSchema.extend({
  type: z.literal('insertion'),
  value: safeTemplate,
})

export const snippetPresetSchema = basePresetSchema.extend({
  type: z.literal('snippet'),
  template: safeTemplate,
})

export const presetSchema = z.discriminatedUnion('type', [
  formattingPresetSchema,
  linkPresetSchema,
  insertionPresetSchema,
  snippetPresetSchema,
])

export const presetPackSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  presets: z.array(presetSchema),
})

export type FormattingPreset = z.infer<typeof formattingPresetSchema>
export type LinkPreset = z.infer<typeof linkPresetSchema>
export type InsertionPreset = z.infer<typeof insertionPresetSchema>
export type SnippetPreset = z.infer<typeof snippetPresetSchema>
export type Preset = z.infer<typeof presetSchema>
export type PresetPack = z.infer<typeof presetPackSchema>
