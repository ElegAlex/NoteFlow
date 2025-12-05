// ===========================================
// Extension TipTap MathBlock (US-018)
// Syntaxe: $$...$$ (bloc centré)
// ===========================================

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { InputRule } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { MathBlockView } from './MathView';

export interface MathBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathBlock: {
      /**
       * Insère un bloc d'équation
       */
      setMathBlock: (latex: string) => ReturnType;
    };
  }
}

// Regex pour détecter $$...$$ sur une ligne
const MATH_BLOCK_INPUT_REGEX = /^\$\$([^$]+)\$\$$/;

export const MathBlockExtension = Node.create<MathBlockOptions>({
  name: 'mathBlock',

  group: 'block',

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
        tag: 'div[data-type="math-block"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'math-block',
        'data-latex': node.attrs.latex,
        class: 'math-block',
      }),
      node.attrs.latex,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockView);
  },

  addCommands() {
    return {
      setMathBlock:
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
        find: MATH_BLOCK_INPUT_REGEX,
        handler: ({ state, range, match }) => {
          const latex = match[1];
          if (!latex) return null;

          const { tr } = state;
          const start = range.from;
          const end = range.to;

          const node = this.type.create({ latex: latex.trim() });
          tr.replaceRangeWith(start, end, node);

          // Créer un paragraphe après et y positionner le curseur
          const paragraphType = state.schema.nodes.paragraph;
          if (paragraphType) {
            const pos = tr.selection.from;
            tr.insert(pos, paragraphType.create());
            tr.setSelection(TextSelection.create(tr.doc, pos + 1));
          }
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Cmd/Ctrl+Shift+M pour insérer un bloc math
      'Mod-Shift-m': () => {
        return this.editor.commands.setMathBlock('');
      },
      // Enter après un mathBlock crée un paragraphe
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // Vérifier si on est juste après un mathBlock
        const nodeBefore = $from.nodeBefore;
        if (nodeBefore?.type.name === 'mathBlock') {
          editor.commands.insertContentAt($from.pos, { type: 'paragraph' });
          return true;
        }

        return false;
      },
    };
  },
});
