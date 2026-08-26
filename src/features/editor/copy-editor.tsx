'use client'

import { EditorContent } from '@tiptap/react'
import type { FormattingPreset, InsertionPreset, LinkPreset, SnippetPreset } from '@/core/presets/schemas'
import type { SerializationResult } from '@/core/serializer/serialize-editor-html'
import { EditorToolbar } from './editor-toolbar'
import { useCopyEditor } from './use-copy-editor'

type CopyEditorProps = {
  onSerializedChange: (result: SerializationResult) => void
  onNotice: (message: string) => void
  registerPresetActions?: (actions: {
    applyFormattingPreset: (preset: FormattingPreset) => boolean
    applyLinkPreset: (preset: LinkPreset) => boolean
    insertPreset: (preset: InsertionPreset) => boolean
    insertSnippet: (preset: SnippetPreset) => boolean
  }) => void
}

export function CopyEditor({ onSerializedChange, onNotice, registerPresetActions }: CopyEditorProps) {
  const actions = useCopyEditor({ onSerializedChange, onNotice })

  if (registerPresetActions) {
    registerPresetActions({
      applyFormattingPreset: actions.applyFormattingPreset,
      applyLinkPreset: actions.applyLinkPreset,
      insertPreset: actions.insertPreset,
      insertSnippet: actions.insertSnippet,
    })
  }

  return (
    <div className="editor-shell">
      <EditorToolbar editor={actions.editor} />
      <EditorContent editor={actions.editor} className="copy-editor" aria-label="Editor de copy" />
    </div>
  )
}
