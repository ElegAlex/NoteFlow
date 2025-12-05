// ===========================================
// Sérialiseur Markdown pour Callout (US-015)
// Convertit HTML callout → syntaxe Markdown
// ===========================================

import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { type CalloutType, CALLOUT_LABELS } from './constants';

/**
 * Sérialise un noeud Callout vers la syntaxe Markdown Obsidian-style
 *
 * Formats supportés:
 * - > [!note]
 * - > [!warning] Titre personnalisé
 * - > [!tip]+ (collapsible, ouvert par défaut)
 * - > [!info]- (collapsible, fermé par défaut)
 *
 * @param node - Le noeud ProseMirror callout
 * @param contentToMarkdown - Fonction pour convertir le contenu enfant
 * @returns Le callout sérialisé en Markdown
 */
export function serializeCalloutToMarkdown(
  node: ProseMirrorNode,
  contentToMarkdown: (content: ProseMirrorNode) => string
): string {
  const type = node.attrs.type as CalloutType;
  const title = node.attrs.title as string | null;
  const collapsible = node.attrs.collapsible as boolean;
  const collapsed = node.attrs.collapsed as boolean;

  // Construire la ligne d'en-tête
  let header = `> [!${type}]`;

  // Ajouter le marqueur de collapse si nécessaire
  if (collapsible) {
    header += collapsed ? '-' : '+';
  }

  // Ajouter le titre s'il est différent du label par défaut
  const defaultLabel = CALLOUT_LABELS[type];
  if (title && title !== defaultLabel) {
    header += ` ${title}`;
  }

  // Sérialiser le contenu et préfixer chaque ligne avec >
  const contentLines: string[] = [];
  node.content.forEach((child) => {
    const childMarkdown = contentToMarkdown(child);
    const lines = childMarkdown.split('\n');
    lines.forEach((line) => {
      contentLines.push(`> ${line}`);
    });
  });

  return [header, ...contentLines].join('\n');
}

/**
 * Parse une syntaxe Markdown callout vers les attributs du noeud
 *
 * @param markdown - La ligne Markdown à parser (ex: "> [!info]+ Mon titre")
 * @returns Les attributs parsés ou null si pas un callout valide
 */
export function parseCalloutFromMarkdown(markdown: string): {
  type: CalloutType;
  title: string | null;
  collapsible: boolean;
  collapsed: boolean;
} | null {
  const match = markdown.match(/^>\s*\[!(\w+)\]([+-])?\s*(.*)$/);
  if (!match) return null;

  const [, typeRaw, collapseMarker, titleRaw] = match;
  if (!typeRaw) return null;

  return {
    type: typeRaw.toLowerCase() as CalloutType,
    title: titleRaw?.trim() || null,
    collapsible: collapseMarker === '+' || collapseMarker === '-',
    collapsed: collapseMarker === '-',
  };
}

/**
 * Configuration du sérialiseur pour intégration avec un convertisseur global
 * Compatible avec prosemirror-markdown ou tiptap-markdown
 */
export const calloutMarkdownSerializerSpec = {
  nodes: {
    callout: (state: { write: (s: string) => void; renderContent: (n: ProseMirrorNode) => void }, node: ProseMirrorNode) => {
      const type = node.attrs.type as CalloutType;
      const title = node.attrs.title as string | null;
      const collapsible = node.attrs.collapsible as boolean;
      const collapsed = node.attrs.collapsed as boolean;

      // Header
      let header = `> [!${type}]`;
      if (collapsible) header += collapsed ? '-' : '+';
      if (title && title !== CALLOUT_LABELS[type]) header += ` ${title}`;

      state.write(header + '\n');

      // Contenu préfixé avec >
      // Note: Dans une implémentation complète, il faudrait wrapper renderContent
      // pour préfixer chaque ligne. Pour l'instant, on fait un rendu basique.
      state.write('> ');
      state.renderContent(node);
      state.write('\n');
    },
  },
};
