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

function hasMultipleWords(value: string): boolean {
  return value.trim().split(/\s+/u).filter(Boolean).length > 1
}

function needsWordBoundarySpace(left: string, right: string): boolean {
  if (/\s$/u.test(left) || /^\s/u.test(right)) return false
  return /[\p{L}\p{N}]$/u.test(left) && /^[\p{L}\p{N}]/u.test(right)
}

function sameFormatting(left: VisualTextSegment, right: VisualTextSegment): boolean {
  return left.bold === right.bold
    && left.italic === right.italic
    && left.color === right.color
}

function joinSegmentText(left: string, right: string): string {
  return `${left}${needsWordBoundarySpace(left, right) ? ' ' : ''}${right}`
}

export function normalizeStructuredVisualCopy(input: StructuredVisualCopy): StructuredVisualCopy {
  const parsed = structuredVisualCopySchema.parse(input)

  return {
    blocks: parsed.blocks.map((block) => {
      const segments: VisualTextSegment[] = []

      for (const segment of block.segments) {
        const previous = segments.at(-1)

        if (!previous) {
          segments.push({ ...segment })
          continue
        }

        if (sameFormatting(previous, segment)) {
          previous.text = joinSegmentText(previous.text, segment.text)
          continue
        }

        segments.push({
          ...segment,
          text: needsWordBoundarySpace(previous.text, segment.text)
            ? ` ${segment.text}`
            : segment.text,
        })
      }

      return { segments }
    }),
  }
}

function renderSegment(segment: VisualTextSegment): string {
  let content = escapeHtml(segment.text)
  if (segment.italic) content = `<em>${content}</em>`

  if (segment.color) {
    const displayStyle = hasMultipleWords(segment.text) ? ' display: inline-block;' : ''
    return `<strong style="color: ${segment.color};${displayStyle}">${content}</strong>`
  }

  if (segment.bold) content = `<strong>${content}</strong>`
  return content
}

export function structuredVisualCopyToEditorHtml(input: StructuredVisualCopy): string {
  const normalized = normalizeStructuredVisualCopy(input)
  return normalized.blocks
    .map((block) => `<p>${block.segments.map(renderSegment).join('')}</p>`)
    .join('')
}

export function summarizeStructuredVisualCopy(input: StructuredVisualCopy) {
  const normalized = normalizeStructuredVisualCopy(input)
  const segments = normalized.blocks.flatMap((block) => block.segments)
  return {
    blocks: normalized.blocks.length,
    boldSegments: segments.filter((segment) => segment.bold).length,
    italicSegments: segments.filter((segment) => segment.italic).length,
    coloredSegments: segments.filter((segment) => segment.color !== null).length,
  }
}
