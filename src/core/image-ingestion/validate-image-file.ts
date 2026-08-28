export const IMAGE_INGESTION_MAX_BYTES = 12 * 1024 * 1024

export const IMAGE_INGESTION_ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const

export type ImageIngestionValidation =
  | { success: true }
  | { success: false; error: string }

export function validateImageFile(file: File): ImageIngestionValidation {
  if (!IMAGE_INGESTION_ACCEPTED_TYPES.includes(file.type as (typeof IMAGE_INGESTION_ACCEPTED_TYPES)[number])) {
    return {
      success: false,
      error: 'Use uma imagem PNG, JPG ou WebP.',
    }
  }

  if (file.size <= 0) {
    return {
      success: false,
      error: 'A imagem está vazia e não pode ser processada.',
    }
  }

  if (file.size > IMAGE_INGESTION_MAX_BYTES) {
    return {
      success: false,
      error: 'A imagem ultrapassa o limite de 12 MB.',
    }
  }

  return { success: true }
}

export function formatImageFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
