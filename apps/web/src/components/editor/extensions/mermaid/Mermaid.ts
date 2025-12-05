// ===========================================
// Extension TipTap Mermaid (US-019)
// Syntaxe: ```mermaid ... ```
// ===========================================

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TextSelection } from '@tiptap/pm/state';
import { MermaidView } from './MermaidView';

export interface MermaidOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mermaid: {
      /**
       * Insère un bloc Mermaid
       */
      setMermaid: (code?: string) => ReturnType;
    };
  }
}

export const MermaidExtension = Node.create<MermaidOptions>({
  name: 'mermaid',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      code: {
        default: '',
        parseHTML: (element) => {
          // Essayer de récupérer depuis data-code ou le contenu
          return element.getAttribute('data-code') || element.textContent || '';
        },
        renderHTML: (attributes) => ({
          'data-code': attributes.code,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="mermaid"]',
      },
      {
        // Parser les blocs de code ```mermaid
        tag: 'pre',
        getAttrs: (element) => {
          if (typeof element === 'string') return false;
          const code = element.querySelector('code');
          if (code?.classList.contains('language-mermaid')) {
            return { code: code.textContent || '' };
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'mermaid',
        'data-code': node.attrs.code,
        class: 'mermaid-block',
      }),
      node.attrs.code,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidView);
  },

  addCommands() {
    return {
      setMermaid:
        (code = '') =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { code },
          });
        },
    };
  },

  addInputRules() {
    // Pas d'InputRule simple pour ```mermaid car c'est géré par le CodeBlock
    // On utilisera plutôt la conversion depuis un bloc de code
    return [];
  },

  addKeyboardShortcuts() {
    return {
      // Cmd/Ctrl+Alt+M pour insérer un diagramme Mermaid
      'Mod-Alt-m': () => {
        return this.editor.commands.setMermaid(`flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[Cancel]`);
      },
      // Enter après un mermaid crée un paragraphe
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        const nodeBefore = $from.nodeBefore;
        if (nodeBefore?.type.name === 'mermaid') {
          const paragraphType = state.schema.nodes.paragraph;
          if (paragraphType) {
            editor.commands.insertContentAt($from.pos, { type: 'paragraph' });
            return true;
          }
        }

        return false;
      },
    };
  },
});

/**
 * Convertit un bloc de code ```mermaid en noeud Mermaid
 * À utiliser dans un plugin ou une commande
 */
export function convertCodeBlockToMermaid(editor: ReturnType<typeof import('@tiptap/react').useEditor>) {
  if (!editor) return false;

  const { state } = editor;
  const { selection } = state;
  const { $from } = selection;

  // Vérifier si on est dans un codeBlock avec language mermaid
  const node = $from.parent;
  if (node.type.name === 'codeBlock' && node.attrs.language === 'mermaid') {
    const code = node.textContent;
    const pos = $from.before();

    editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + node.nodeSize })
      .insertContentAt(pos, {
        type: 'mermaid',
        attrs: { code },
      })
      .run();

    return true;
  }

  return false;
}
