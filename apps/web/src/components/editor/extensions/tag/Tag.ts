// ===========================================
// Extension TipTap Tag Mark (US-017)
// Syntaxe: #tag et #projet/sous-tag
// ===========================================

import { Mark, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface TagOptions {
  HTMLAttributes: Record<string, unknown>;
  onTagClick?: (tag: string) => void;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tag: {
      /**
       * Insère un tag à la position du curseur
       */
      insertTag: (name: string) => ReturnType;
    };
  }
}

// Regex pour détecter les tags: #tag, #projet/sous-tag, #tag-avec-tirets
// Supporte: lettres, chiffres, tirets, underscores, et / pour hiérarchie
const TAG_REGEX = /#([\w\-/]+)/g;

export const TagExtension = Mark.create<TagOptions>({
  name: 'tag',

  addOptions() {
    return {
      HTMLAttributes: {},
      onTagClick: undefined,
    };
  },

  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-tag'),
        renderHTML: (attributes) => ({
          'data-tag': attributes.name,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="tag"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'tag',
        class: 'inline-tag',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      insertTag:
        (name: string) =>
        ({ commands }) => {
          return commands.insertContent(`#${name} `);
        },
    };
  },

  addProseMirrorPlugins() {
    const onTagClick = this.options.onTagClick;

    return [
      new Plugin({
        key: new PluginKey('tag-decorator'),
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = [];
            const doc = state.doc;

            doc.descendants((node, pos) => {
              if (!node.isText) return;

              const text = node.text || '';
              let match;

              // Reset regex lastIndex
              TAG_REGEX.lastIndex = 0;

              while ((match = TAG_REGEX.exec(text)) !== null) {
                const start = pos + match.index;
                const end = start + match[0].length;
                const tagName = match[1];

                decorations.push(
                  Decoration.inline(start, end, {
                    class: 'inline-tag',
                    'data-tag': tagName,
                  })
                );
              }
            });

            return DecorationSet.create(doc, decorations);
          },
          handleClick: (view, pos, event) => {
            const target = event.target as HTMLElement;

            if (target.classList.contains('inline-tag')) {
              const tagName = target.getAttribute('data-tag');
              if (tagName && onTagClick) {
                event.preventDefault();
                onTagClick(tagName);
                return true;
              }
            }

            return false;
          },
        },
      }),
    ];
  },
});

/**
 * Factory pour créer l'extension avec callback de navigation
 */
export function createTagExtension(onTagClick: (tag: string) => void) {
  return TagExtension.configure({
    onTagClick,
  });
}
