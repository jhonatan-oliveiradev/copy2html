'use client'

import type { Editor } from '@tiptap/react'

type EditorToolbarProps = {
  editor: Editor | null
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const disabled = !editor

  return (
    <div className="toolbar" role="toolbar" aria-label="Formatação do editor">
      <button type="button" disabled={disabled} aria-pressed={editor?.isActive('bold') ?? false} onClick={() => editor?.chain().focus().toggleBold().run()}>
        Negrito
      </button>
      <button type="button" disabled={disabled} aria-pressed={editor?.isActive('italic') ?? false} onClick={() => editor?.chain().focus().toggleItalic().run()}>
        Itálico
      </button>
      <button type="button" disabled={disabled} onClick={() => editor?.chain().focus().unsetAllMarks().run()}>
        Limpar formatação
      </button>
      <button type="button" disabled={disabled} onClick={() => editor?.chain().focus().insertContent('<br />').run()}>
        Quebra simples
      </button>
      <button type="button" disabled={disabled} onClick={() => editor?.chain().focus().insertContent('<br /><br />').run()}>
        Quebra dupla
      </button>
      <span className="toolbar-separator" aria-hidden="true" />
      <button type="button" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}>
        Desfazer
      </button>
      <button type="button" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}>
        Refazer
      </button>
    </div>
  )
}
