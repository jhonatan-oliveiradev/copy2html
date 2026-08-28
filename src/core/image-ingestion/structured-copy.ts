import { z } from 'zod'

export const SMILES_VISUAL_COLORS = [
  '#663399',
  '#ff7020',
  '#231f20',
  '#C6A76E',
  '#737373',
] as const

export const visualTextColorSchema = z.enum(SMILES_VISUAL_COLORS).nullable().default(null)

export const visualTextSegmentSchema = z.object({
  text: z.string().min(1).max(10_000),
  bold: z.boolean().default(false),
  italic: z.boolean().default(false),
  color: visualTextColorSchema,
})

export const visualCopyBlockSchema = z.object({
  segments: z.array(visualTextSegmentSchema).min(1).max(200),
})

export const structuredVisualCopySchema = z.object({
  blocks: z.array(visualCopyBlockSchema).min(1).max(300),
})

export type VisualTextSegment = z.output<typeof visualTextSegmentSchema>
export type StructuredVisualCopy = z.output<typeof structuredVisualCopySchema>

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderSegment(segment: VisualTextSegment): string {
  let content = escapeHtml(segment.text)
  if (segment.italic) content = `<em>${content}</em>`
  if (segment.bold) content = `<strong>${content}</strong>`
  if (segment.color) content = `<span style="color: ${segment.color}">${content}</span>`
  return content
}

export function structuredVisualCopyToEditorHtml(input: StructuredVisualCopy): string {
  const parsed = structuredVisualCopySchema.parse(input)
  return parsed.blocks
    .map((block) => `<p>${block.segments.map(renderSegment).join('')}</p>`)
    .join('')
}

export function summarizeStructuredVisualCopy(input: StructuredVisualCopy) {
  const parsed = structuredVisualCopySchema.parse(input)
  const segments = parsed.blocks.flatMap((block) => block.segments)
  return {
    blocks: parsed.blocks.length,
    boldSegments: segments.filter((segment) => segment.bold).length,
    italicSegments: segments.filter((segment) => segment.italic).length,
    coloredSegments: segments.filter((segment) => segment.color !== null).length,
  }
}
