// ===========================================
// Extension TipTap Toggle (US-020)
// Syntaxe: :::toggle Titre
// ===========================================

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { InputRule } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { ToggleView } from './ToggleView';

export interface ToggleOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggle: {
      /**
       * Insère une section toggle
       */
      setToggle: (attrs?: { title?: string; open?: boolean }) => ReturnType;
      /**
       * Toggle wrap la sélection
       */
      toggleToggle: () => ReturnType;
      /**
       * Supprime le toggle et garde le contenu
       */
      unsetToggle: () => ReturnType;
    };
  }
}

// Regex pour détecter :::toggle Titre
const TOGGLE_INPUT_REGEX = /^:::toggle\s+(.+)$/;

export const ToggleExtension = Node.create<ToggleOptions>({
  name: 'toggle',

  group: 'block',

  content: 'block+',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      title: {
        default: 'Section',
        parseHTML: (element) => element.getAttribute('data-title') || 'Section',
        renderHTML: (attributes) => ({
          'data-title': attributes.title,
        }),
      },
      open: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-open') !== 'false',
        renderHTML: (attributes) => ({
          'data-open': attributes.open ? 'true' : 'false',
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="toggle"]',
      },
      {
        tag: 'details',
        getAttrs: (element) => {
          if (typeof element === 'string') return false;
          const summary = element.querySelector('summary');
          return {
            title: summary?.textContent || 'Section',
            open: element.hasAttribute('open'),
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'toggle',
        'data-title': node.attrs.title,
        'data-open': node.attrs.open ? 'true' : 'false',
        class: 'toggle-block',
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleView);
  },

  addCommands() {
    return {
      setToggle:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, {
            title: attrs.title || 'Section',
            open: attrs.open ?? true,
          });
        },
      toggleToggle:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name);
        },
      unsetToggle:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: TOGGLE_INPUT_REGEX,
        handler: ({ state, range, match }) => {
          const title = match[1]?.trim();
          if (!title) return null;

          const { tr } = state;
          const start = range.from;
          const end = range.to;

          // Vérifier que le schéma a le noeud paragraph
          const paragraphType = state.schema.nodes.paragraph;
          if (!paragraphType) return null;

          // Créer le noeud toggle avec un paragraphe vide
          const toggleNode = this.type.create(
            { title, open: true },
            paragraphType.create()
          );

          tr.replaceRangeWith(start, end, toggleNode);

          // Positionner le curseur dans le contenu du toggle
          const resolvedPos = tr.doc.resolve(start + 2);
          tr.setSelection(TextSelection.near(resolvedPos));
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Cmd/Ctrl+Shift+T pour insérer un toggle
      'Mod-Shift-t': () => {
        const title = window.prompt('Titre de la section:', 'Section');
        if (title) {
          return this.editor.commands.setToggle({ title });
        }
        return false;
      },
      // Backspace au début d'un toggle vide le supprime
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // Vérifier si on est au début d'un toggle
        const toggleNode = $from.node(-1);
        if (toggleNode?.type.name !== 'toggle') {
          return false;
        }

        // Vérifier si on est au début du contenu
        const isAtStart = $from.parentOffset === 0;
        const isFirstChild = $from.index(-1) === 0;

        if (isAtStart && isFirstChild) {
          // Vérifier si le contenu est vide
          const content = toggleNode.content;
          const isEmpty =
            content.childCount === 1 &&
            content.firstChild?.type.name === 'paragraph' &&
            content.firstChild.content.size === 0;

          if (isEmpty) {
            return editor.commands.unsetToggle();
          }
        }

        return false;
      },
    };
  },
});
