// ===========================================
// Popup de suggestion de tags (US-017)
// S'affiche lors de la frappe de #
// ===========================================

import type { TagSuggestion } from './useTagSuggestion';

interface TagSuggestionPopupProps {
  isOpen: boolean;
  items: TagSuggestion[];
  selectedIndex: number;
  position: { top: number; left: number } | null;
  query: string;
  onSelect: (tag: TagSuggestion) => void;
  onCreateNew?: () => void;
}

export function TagSuggestionPopup({
  isOpen,
  items,
  selectedIndex,
  position,
  query,
  onSelect,
  onCreateNew,
}: TagSuggestionPopupProps) {
  if (!isOpen || !position) return null;

  const showCreateOption = query.length > 0 && items.length === 0;

  return (
    <div
      className="tag-suggestion-popup absolute z-50 min-w-[200px] max-w-[300px] bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
      style={{
        top: position.top + 4,
        left: position.left,
      }}
    >
      {items.length > 0 ? (
        <div className="py-1">
          {items.map((item, index) => (
            <button
              key={item.id}
              className={`
                w-full text-left px-3 py-2 flex items-center gap-2
                transition-colors cursor-pointer
                ${index === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted'
                }
              `}
              onClick={() => onSelect(item)}
              onMouseEnter={(e) => e.currentTarget.focus()}
            >
              {/* Color indicator */}
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: item.color || '#6b7280',
                }}
              />
              {/* Tag name */}
              <span className="flex-1 text-sm truncate">
                <span className="text-muted-foreground">#</span>
                {item.name}
              </span>
              {/* Note count */}
              <span className="text-xs text-muted-foreground">
                {item.noteCount}
              </span>
            </button>
          ))}
        </div>
      ) : showCreateOption ? (
        <button
          className={`
            w-full text-left px-3 py-2 flex items-center gap-2
            transition-colors cursor-pointer
            ${selectedIndex === 0 ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}
          `}
          onClick={onCreateNew}
        >
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="text-sm">
            Créer <span className="font-medium">#{query}</span>
          </span>
        </button>
      ) : (
        <div className="px-3 py-2 text-sm text-muted-foreground">
          Tapez pour rechercher des tags...
        </div>
      )}
    </div>
  );
}
