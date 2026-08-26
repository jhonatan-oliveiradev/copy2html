import { z } from 'zod'
import { isSafeHref, sanitizeStyle } from '@/core/sanitizer/sanitizer-policy'

function templateStylesAreSafe(value: string): boolean {
  const matches = value.matchAll(/\bstyle\s*=\s*["']([^"']*)["']/gi)
  for (const match of matches) {
    if (sanitizeStyle(match[1] ?? '').changed) return false
  }
  return true
}

const safeTemplate = z
  .string()
  .min(1)
  .refine((value) => !/<script\b/i.test(value), 'Scripts are not allowed in preset templates')
  .refine((value) => !/\son\w+\s*=/i.test(value), 'Event handlers are not allowed in preset templates')
  .refine((value) => !/javascript\s*:/i.test(value), 'Unsafe URL schemes are not allowed')
  .refine(templateStylesAreSafe, 'Unsupported style properties are not allowed in preset templates')

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
  href: z.string().min(1).refine(isSafeHref, 'Unsafe or invalid link destination'),
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

export const previewThemeSchema = z.object({
  fontFamily: z.string().min(1),
  fontStylesheetUrl: z.url().refine((value) => value.startsWith('https://'), 'Preview font stylesheet must use HTTPS').optional(),
})

export const presetPackSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  previewTheme: previewThemeSchema.optional(),
  presets: z.array(presetSchema),
})

export type FormattingPreset = z.output<typeof formattingPresetSchema>
export type LinkPreset = z.output<typeof linkPresetSchema>
export type InsertionPreset = z.output<typeof insertionPresetSchema>
export type SnippetPreset = z.output<typeof snippetPresetSchema>
export type Preset = z.output<typeof presetSchema>
export type PresetInput = z.input<typeof presetSchema>
export type PreviewTheme = z.output<typeof previewThemeSchema>
export type PresetPack = z.output<typeof presetPackSchema>
