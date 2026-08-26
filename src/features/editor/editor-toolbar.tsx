'use client'

import type { ReactNode } from 'react'
import type { Editor } from '@tiptap/react'

type EditorToolbarProps = {
  editor: Editor | null
}

function ToolIcon({ children }: { children: ReactNode }) {
  return <span className="toolbar-icon" aria-hidden="true">{children}</span>
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const disabled = !editor

  return (
    <div className="toolbar" role="toolbar" aria-label="Formatação do editor">
      <button
        type="button"
        title="Negrito"
        disabled={disabled}
        aria-pressed={editor?.isActive('bold') ?? false}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <ToolIcon><strong>B</strong></ToolIcon>
        <span className="toolbar-label">Negrito</span>
      </button>
      <button
        type="button"
        title="Itálico"
        disabled={disabled}
        aria-pressed={editor?.isActive('italic') ?? false}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <ToolIcon><em>I</em></ToolIcon>
        <span className="toolbar-label">Itálico</span>
      </button>
      <button
        type="button"
        title="Limpar formatação"
        disabled={disabled}
        onClick={() => editor?.chain().focus().unsetAllMarks().run()}
      >
        <ToolIcon>Tx</ToolIcon>
        <span className="toolbar-label">Limpar</span>
      </button>
      <span className="toolbar-separator" aria-hidden="true" />
      <button
        type="button"
        title="Inserir quebra simples"
        disabled={disabled}
        onClick={() => editor?.chain().focus().insertContent('<br />').run()}
      >
        <ToolIcon>↵</ToolIcon>
        <span className="toolbar-label">Quebra simples</span>
      </button>
      <button
        type="button"
        title="Inserir quebra dupla"
        disabled={disabled}
        onClick={() => editor?.chain().focus().insertContent('<br /><br />').run()}
      >
        <ToolIcon>↵↵</ToolIcon>
        <span className="toolbar-label">Quebra dupla</span>
      </button>
      <span className="toolbar-separator" aria-hidden="true" />
      <button type="button" title="Desfazer" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}>
        <ToolIcon>↶</ToolIcon>
        <span className="toolbar-label">Desfazer</span>
      </button>
      <button type="button" title="Refazer" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}>
        <ToolIcon>↷</ToolIcon>
        <span className="toolbar-label">Refazer</span>
      </button>
    </div>
  )
}
