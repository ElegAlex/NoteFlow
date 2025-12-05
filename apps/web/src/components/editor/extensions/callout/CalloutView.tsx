// ===========================================
// Composant React NodeView pour Callout (US-015)
// Rendu interactif avec collapse/expand
// ===========================================

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import {
  type CalloutType,
  CALLOUT_ICONS,
  CALLOUT_COLORS,
  CALLOUT_LABELS,
  resolveCalloutType
} from './constants';

interface CalloutViewProps {
  node: ProseMirrorNode;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  selected: boolean;
}

export function CalloutView({ node, updateAttributes, selected }: CalloutViewProps) {
  const type = resolveCalloutType(node.attrs.type) as CalloutType;
  const title = node.attrs.title || CALLOUT_LABELS[type];
  const collapsible = node.attrs.collapsible ?? false;
  const collapsed = node.attrs.collapsed ?? false;

  const colors = CALLOUT_COLORS[type];
  const iconPath = CALLOUT_ICONS[type];

  const toggleCollapsed = () => {
    if (collapsible) {
      updateAttributes({ collapsed: !collapsed });
    }
  };

  return (
    <NodeViewWrapper
      className={`
        callout my-4 rounded-lg border-l-4 ${colors.bg} ${colors.border}
        ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}
      `}
      data-type="callout"
      data-callout-type={type}
    >
      {/* Header */}
      <div
        className={`
          flex items-center gap-2 px-4 py-2
          ${collapsible ? 'cursor-pointer select-none' : ''}
        `}
        onClick={toggleCollapsed}
      >
        {/* Icon */}
        <svg
          className={`h-5 w-5 flex-shrink-0 ${colors.icon}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={iconPath} />
        </svg>

        {/* Title */}
        <span className={`font-semibold ${colors.title}`}>
          {title}
        </span>

        {/* Collapse indicator */}
        {collapsible && (
          <svg
            className={`
              h-4 w-4 ml-auto transition-transform duration-200 ${colors.icon}
              ${collapsed ? '' : 'rotate-90'}
            `}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </div>

      {/* Content */}
      <div
        className={`
          px-4 pb-3 pt-0
          ${collapsed ? 'hidden' : 'block'}
        `}
      >
        <NodeViewContent className="callout-content prose prose-sm max-w-none" />
      </div>
    </NodeViewWrapper>
  );
}
