// ===========================================
// Extension TipTap MathInline (US-018)
// Syntaxe: $E=mc^2$ (inline)
// ===========================================

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { InputRule } from '@tiptap/core';
import { MathInlineView } from './MathView';

export interface MathInlineOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathInline: {
      /**
       * Insère une équation inline
       */
      setMathInline: (latex: string) => ReturnType;
    };
  }
}

// Regex pour détecter $...$ (pas $$)
// Capture le contenu entre $ simples, évite les $$ pour les blocs
const MATH_INLINE_INPUT_REGEX = /(?<!\$)\$([^$\n]+)\$(?!\$)$/;

export const MathInlineExtension = Node.create<MathInlineOptions>({
  name: 'mathInline',

  group: 'inline',

  inline: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') || element.textContent,
        renderHTML: (attributes) => ({
          'data-latex': attributes.latex,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math-inline"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'math-inline',
        'data-latex': node.attrs.latex,
        class: 'math-inline',
      }),
      node.attrs.latex,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathInlineView);
  },

  addCommands() {
    return {
      setMathInline:
        (latex: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex },
          });
        },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: MATH_INLINE_INPUT_REGEX,
        handler: ({ state, range, match }) => {
          const latex = match[1];
          if (!latex) return null;

          const { tr } = state;
          const start = range.from;
          const end = range.to;

          const node = this.type.create({ latex });
          tr.replaceRangeWith(start, end, node);

          // Ajouter un espace après pour continuer à taper
          tr.insertText(' ', tr.selection.from);
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Backspace sur un noeud math le supprime
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // Vérifier si le noeud avant le curseur est un mathInline
        const nodeBefore = $from.nodeBefore;
        if (nodeBefore?.type.name === 'mathInline') {
          editor.commands.deleteRange({
            from: $from.pos - nodeBefore.nodeSize,
            to: $from.pos,
          });
          return true;
        }

        return false;
      },
    };
  },
});
