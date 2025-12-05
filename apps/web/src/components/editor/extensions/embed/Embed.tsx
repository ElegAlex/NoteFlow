// ===========================================
// Extension TipTap pour les Embeds ![[note]] (US-040)
// Affiche un aperçu inline de la note liée
// ===========================================

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { EmbedNodeView } from './EmbedNodeView';

export interface EmbedOptions {
  HTMLAttributes: Record<string, unknown>;
  /** Fonction pour récupérer le contenu d'une note */
  fetchNote?: (title: string) => Promise<{ title: string; content: string; slug: string } | null>;
  /** Callback pour naviguer vers une note */
  onNavigate?: (slug: string) => void;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      insertEmbed: (title: string) => ReturnType;
    };
  }
}

export const EmbedExtension = Node.create<EmbedOptions>({
  name: 'embed',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      fetchNote: undefined,
      onNavigate: undefined,
    };
  },

  addAttributes() {
    return {
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => ({
          'data-title': attributes.title,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="embed"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'embed',
        class: 'embed-block',
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedNodeView);
  },

  addCommands() {
    return {
      insertEmbed:
        (title: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { title },
          });
        },
    };
  },

  addProseMirrorPlugins() {
    const embedRegex = /!\[\[([^\]]+)\]\]/g;

    return [
      // Plugin pour transformer ![[note]] en nœud embed
      new Plugin({
        key: new PluginKey('embed-input-rule'),
        props: {
          handleTextInput: (view, from, to, text) => {
            // Obtenir le texte précédent
            const { state } = view;
            const $from = state.doc.resolve(from);
            const textBefore = $from.parent.textBetween(
              Math.max(0, $from.parentOffset - 10),
              $from.parentOffset,
              ''
            );

            const combinedText = textBefore + text;

            // Vérifier si on vient de compléter ![[...]]
            const match = combinedText.match(/!\[\[([^\]]+)\]\]$/);
            if (match) {
              const title = match[1];
              const matchLength = match[0].length;
              const startPos = from - (textBefore.length - (combinedText.length - matchLength));

              // Vérifier que le type de nœud embed existe
              const embedType = state.schema.nodes.embed;
              if (!embedType) return false;

              // Remplacer par un nœud embed
              const tr = state.tr;
              tr.delete(startPos, to);
              tr.insert(startPos, embedType.create({ title }));
              view.dispatch(tr);
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Ctrl/Cmd + Shift + E pour insérer un embed
      'Mod-Shift-e': () => {
        const title = window.prompt('Titre de la note à intégrer:');
        if (title) {
          return this.editor.commands.insertEmbed(title);
        }
        return false;
      },
    };
  },
});

// Helper pour créer l'extension avec les callbacks
export function createEmbedExtension(options: Omit<EmbedOptions, 'HTMLAttributes'>) {
  return EmbedExtension.configure(options);
}
