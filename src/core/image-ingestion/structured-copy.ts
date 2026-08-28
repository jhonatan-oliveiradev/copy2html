import { z } from 'zod'

export const visualTextSegmentSchema = z.object({
  text: z.string().min(1).max(10_000),
  bold: z.boolean().default(false),
  italic: z.boolean().default(false),
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
  return content
}

export function structuredVisualCopyToEditorHtml(input: StructuredVisualCopy): string {
  const parsed = structuredVisualCopySchema.parse(input)
  return parsed.blocks
    .map((block) => `<p>${block.segments.map(renderSegment).join('')}</p>`)
    .join('')
}
