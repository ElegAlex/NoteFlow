// ===========================================
// Extension TipTap Callout (US-015)
// Syntaxe: > [!type] titre optionnel
// ===========================================

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { InputRule } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { CalloutView } from './CalloutView';
import { resolveCalloutType, type CalloutType } from './constants';

export interface CalloutOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Insère un callout
       */
      setCallout: (attrs?: {
        type?: CalloutType;
        title?: string;
        collapsible?: boolean;
        collapsed?: boolean;
      }) => ReturnType;
      /**
       * Toggle un callout sur la sélection
       */
      toggleCallout: (attrs?: { type?: CalloutType }) => ReturnType;
      /**
       * Supprime le callout et garde le contenu
       */
      unsetCallout: () => ReturnType;
    };
  }
}

// Regex pour détecter > [!type] titre
// Supporte: > [!info], > [!warning] Mon titre, > [!tip]+ (collapsible ouvert), > [!tip]- (collapsible fermé)
const CALLOUT_INPUT_REGEX = /^>\s*\[!(\w+)\]([+-])?\s*(.*)$/;

export const CalloutExtension = Node.create<CalloutOptions>({
  name: 'callout',

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
      type: {
        default: 'note',
        parseHTML: (element) => element.getAttribute('data-callout-type') || 'note',
        renderHTML: (attributes) => ({
          'data-callout-type': attributes.type,
        }),
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => {
          if (!attributes.title) return {};
          return { 'data-title': attributes.title };
        },
      },
      collapsible: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-collapsible') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.collapsible) return {};
          return { 'data-collapsible': 'true' };
        },
      },
      collapsed: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-collapsed') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.collapsed) return {};
          return { 'data-collapsed': 'true' };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'callout',
        'data-callout-type': node.attrs.type,
        class: `callout callout-${node.attrs.type}`,
      }),
      0, // placeholder pour le contenu
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutView);
  },

  addCommands() {
    return {
      setCallout:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, {
            type: attrs.type || 'note',
            title: attrs.title || null,
            collapsible: attrs.collapsible || false,
            collapsed: attrs.collapsed || false,
          });
        },
      toggleCallout:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, {
            type: attrs.type || 'note',
          });
        },
      unsetCallout:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: CALLOUT_INPUT_REGEX,
        handler: ({ state, range, match }) => {
          const [, typeRaw, collapseMarker, titleRaw] = match;
          if (!typeRaw) return null;

          const type = resolveCalloutType(typeRaw);
          const title = titleRaw?.trim() || null;
          const collapsible = collapseMarker === '+' || collapseMarker === '-';
          const collapsed = collapseMarker === '-';

          const { tr } = state;
          const start = range.from;
          const end = range.to;

          // Vérifier que le schéma a le noeud paragraph
          const paragraphType = state.schema.nodes.paragraph;
          if (!paragraphType) return null;

          // Créer le noeud callout avec un paragraphe vide
          const calloutNode = this.type.create(
            { type, title, collapsible, collapsed },
            paragraphType.create()
          );

          tr.replaceRangeWith(start, end, calloutNode);

          // Positionner le curseur dans le contenu du callout
          const resolvedPos = tr.doc.resolve(start + 2);
          tr.setSelection(TextSelection.near(resolvedPos));
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Cmd/Ctrl+Shift+C pour insérer un callout
      'Mod-Shift-c': () => {
        return this.editor.commands.setCallout({ type: 'note' });
      },
      // Backspace au début d'un callout vide le supprime
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // Vérifier si on est au début d'un callout
        const calloutNode = $from.node(-1);
        if (calloutNode?.type.name !== 'callout') {
          return false;
        }

        // Vérifier si on est au début du contenu
        const isAtStart = $from.parentOffset === 0;
        const isFirstChild = $from.index(-1) === 0;

        if (isAtStart && isFirstChild) {
          // Vérifier si le contenu est vide ou juste un paragraphe vide
          const content = calloutNode.content;
          const isEmpty =
            content.childCount === 1 &&
            content.firstChild?.type.name === 'paragraph' &&
            content.firstChild.content.size === 0;

          if (isEmpty) {
            return editor.commands.unsetCallout();
          }
        }

        return false;
      },
    };
  },
});
