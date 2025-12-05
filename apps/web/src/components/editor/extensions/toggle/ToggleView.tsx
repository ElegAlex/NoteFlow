// ===========================================
// Composant React pour Toggle sections (US-020)
// Sections pliables avec titre cliquable
// ===========================================

import { useState, useEffect } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

export function ToggleView({ node, updateAttributes, selected }: NodeViewProps) {
  const title = (node.attrs.title as string) || 'Section';
  const [isOpen, setIsOpen] = useState((node.attrs.open as boolean) ?? true);

  // Synchroniser avec les attributs du noeud
  useEffect(() => {
    if (node.attrs.open !== isOpen) {
      updateAttributes({ open: isOpen });
    }
  }, [isOpen, node.attrs.open, updateAttributes]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <NodeViewWrapper
      className={`
        toggle-section my-3
        ${selected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}
      `}
      data-type="toggle"
    >
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Header - cliquable pour toggle */}
        <button
          type="button"
          onClick={handleToggle}
          className="
            w-full flex items-center gap-2 px-4 py-3
            bg-muted/50 hover:bg-muted transition-colors
            text-left cursor-pointer select-none
          "
        >
          {/* Chevron icon */}
          <svg
            className={`
              w-4 h-4 text-muted-foreground flex-shrink-0
              transition-transform duration-200
              ${isOpen ? 'rotate-90' : ''}
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

          {/* Title */}
          <span className="font-medium text-foreground flex-1">
            {title}
          </span>

          {/* State indicator */}
          <span className="text-xs text-muted-foreground">
            {isOpen ? 'Cliquez pour réduire' : 'Cliquez pour développer'}
          </span>
        </button>

        {/* Content - collapsible */}
        <div
          className={`
            toggle-content overflow-hidden transition-all duration-200
            ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="px-4 py-3 border-t border-border">
            <NodeViewContent className="toggle-inner prose prose-sm max-w-none" />
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
