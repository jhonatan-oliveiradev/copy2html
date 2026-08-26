'use client'

import { Mark, Node, mergeAttributes } from '@tiptap/core'
import Link from '@tiptap/extension-link'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useCallback, useEffect } from 'react'
import { parseClipboard } from '@/core/clipboard/parse-clipboard'
import type { FormattingPreset, InsertionPreset, LinkPreset, SnippetPreset } from '@/core/presets/schemas'
import { serializeEditorHtml, type SerializationResult } from '@/core/serializer/serialize-editor-html'

const StyledStrong = Mark.create({
  name: 'styledStrong',
  priority: 1000,
  addAttributes() {
    return { style: { default: null } }
  },
  parseHTML() {
    return [{ tag: 'strong[style]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['strong', mergeAttributes(HTMLAttributes), 0]
  },
})

const SmallMark = Mark.create({
  name: 'smallMark',
  addAttributes() {
    return { style: { default: null } }
  },
  parseHTML() {
    return [{ tag: 'small' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['small', mergeAttributes(HTMLAttributes), 0]
  },
})

const HtmlBlock = Node.create({
  name: 'htmlBlock',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes() {
    return {
      class: { default: null },
      style: { default: null },
    }
  },
  parseHTML() {
    return [{ tag: 'div' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0]
  },
})

const StyledLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: { default: null },
    }
  },
})

function inspectTemplate(template: string): { tag: string; style: string | null } {
  const container = document.createElement('template')
  container.innerHTML = template.replace('{{selection}}', 'selection')
  const element = container.content.firstElementChild as HTMLElement | null
  return { tag: element?.tagName.toLowerCase() ?? '', style: element?.getAttribute('style') ?? null }
}

export type CopyEditorOptions = {
  onSerializedChange: (result: SerializationResult) => void
  onNotice?: (message: string) => void
}

export function useCopyEditor({ onSerializedChange, onNotice }: CopyEditorOptions) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      StyledStrong,
      SmallMark,
      HtmlBlock,
      StyledLink.configure({ openOnClick: false, autolink: false, linkOnPaste: true }),
    ],
    content: '<p></p>',
    editorProps: {
      transformPastedHTML(html) {
        const parsed = parseClipboard({ html })
        parsed.notices.forEach((notice) => onNotice?.(notice))
        return parsed.html
      },
    },
    onUpdate({ editor: currentEditor }) {
      onSerializedChange(serializeEditorHtml(currentEditor.getHTML()))
    },
  })

  useEffect(() => {
    if (editor) onSerializedChange(serializeEditorHtml(editor.getHTML()))
  }, [editor, onSerializedChange])

  const applyFormattingPreset = useCallback(
    (preset: FormattingPreset) => {
      if (!editor) return false
      const { tag, style } = inspectTemplate(preset.template)

      if (tag === 'strong' && style) {
        return editor.chain().focus().unsetMark('bold').setMark('styledStrong', { style }).run()
      }
      if (tag === 'strong') return editor.chain().focus().toggleBold().run()
      if (tag === 'small') return editor.chain().focus().setMark('smallMark', { style }).run()

      onNotice?.(`O preset “${preset.label}” usa uma tag ainda não suportada pelo editor visual.`)
      return false
    },
    [editor, onNotice],
  )

  const applyLinkPreset = useCallback(
    (preset: LinkPreset) => {
      if (!editor) return false
      const { style } = inspectTemplate(preset.template)
      return editor.chain().focus().extendMarkRange('link').setLink({ href: preset.href, style } as never).run()
    },
    [editor],
  )

  const insertPreset = useCallback(
    (preset: InsertionPreset) => editor?.chain().focus().insertContent(preset.value).run() ?? false,
    [editor],
  )

  const insertSnippet = useCallback(
    (preset: SnippetPreset) => {
      const content = preset.template.replace('{{text}}', 'Insira o texto aqui')
      return editor?.chain().focus().insertContent(content).run() ?? false
    },
    [editor],
  )

  return { editor, applyFormattingPreset, applyLinkPreset, insertPreset, insertSnippet }
}
