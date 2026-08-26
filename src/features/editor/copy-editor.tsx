'use client'

import { EditorContent } from '@tiptap/react'
import { useEffect } from 'react'
import type { FormattingPreset, InsertionPreset, LinkPreset, SnippetPreset } from '@/core/presets/schemas'
import type { SerializationResult } from '@/core/serializer/serialize-editor-html'
import { EditorToolbar } from './editor-toolbar'
import { useCopyEditor } from './use-copy-editor'

type PresetActions = {
  applyFormattingPreset: (preset: FormattingPreset) => boolean
  applyLinkPreset: (preset: LinkPreset) => boolean
  insertPreset: (preset: InsertionPreset) => boolean
  insertSnippet: (preset: SnippetPreset) => boolean
}

type CopyEditorProps = {
  onSerializedChange: (result: SerializationResult) => void
  onNotice: (message: string) => void
  registerPresetActions?: (actions: PresetActions) => void
}

export function CopyEditor({ onSerializedChange, onNotice, registerPresetActions }: CopyEditorProps) {
  const actions = useCopyEditor({ onSerializedChange, onNotice })

  useEffect(() => {
    registerPresetActions?.({
      applyFormattingPreset: actions.applyFormattingPreset,
      applyLinkPreset: actions.applyLinkPreset,
      insertPreset: actions.insertPreset,
      insertSnippet: actions.insertSnippet,
    })
  }, [
    actions.applyFormattingPreset,
    actions.applyLinkPreset,
    actions.insertPreset,
    actions.insertSnippet,
    registerPresetActions,
  ])

  return (
    <div className="editor-shell">
      <EditorToolbar editor={actions.editor} />
      <EditorContent editor={actions.editor} className="copy-editor" aria-label="Editor de copy" />
    </div>
  )
}
