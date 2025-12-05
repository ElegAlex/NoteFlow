// ===========================================
// Popup de suggestion de wikilinks (US-037)
// S'affiche lors de la frappe de [[
// ===========================================

import type { NoteSuggestion } from './useWikilinkSuggestion';

interface WikilinkSuggestionPopupProps {
  isOpen: boolean;
  items: NoteSuggestion[];
  selectedIndex: number;
  position: { top: number; left: number } | null;
  query: string;
  onSelect: (note: NoteSuggestion) => void;
  onCreateNew?: () => void;
}

export function WikilinkSuggestionPopup({
  isOpen,
  items,
  selectedIndex,
  position,
  query,
  onSelect,
  onCreateNew,
}: WikilinkSuggestionPopupProps) {
  if (!isOpen || !position) return null;

  const showCreateOption = query.length > 0 && items.length === 0;

  return (
    <div
      className="wikilink-suggestion-popup absolute z-50 min-w-[280px] max-w-[400px] bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
      style={{
        top: position.top + 4,
        left: position.left,
      }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <span>Lier une note</span>
          {query && (
            <span className="ml-auto font-mono bg-muted px-1.5 py-0.5 rounded">
              {query}
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {items.length > 0 ? (
        <div className="py-1 max-h-[300px] overflow-y-auto">
          {items.map((item, index) => (
            <button
              key={item.id}
              className={`
                w-full text-left px-3 py-2 flex flex-col gap-0.5
                transition-colors cursor-pointer
                ${index === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted'
                }
              `}
              onClick={() => onSelect(item)}
            >
              {/* Note title */}
              <span className="text-sm font-medium truncate">
                {item.title}
              </span>
              {/* Folder path */}
              <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <svg
                  className="w-3 h-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                {item.folderPath || '/'}
              </span>
            </button>
          ))}
        </div>
      ) : showCreateOption ? (
        <button
          className={`
            w-full text-left px-3 py-3 flex items-center gap-2
            transition-colors cursor-pointer
            ${selectedIndex === 0 ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}
          `}
          onClick={onCreateNew}
        >
          <svg
            className="w-4 h-4 text-muted-foreground flex-shrink-0"
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
            Créer <span className="font-medium">"{query}"</span>
          </span>
        </button>
      ) : (
        <div className="px-3 py-4 text-sm text-muted-foreground text-center">
          {query ? 'Aucune note trouvée' : 'Tapez pour rechercher...'}
        </div>
      )}

      {/* Footer hint */}
      <div className="px-3 py-1.5 border-t border-border bg-muted/30 text-[10px] text-muted-foreground flex items-center gap-3">
        <span>
          <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">↑↓</kbd> naviguer
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">↵</kbd> sélectionner
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">esc</kbd> fermer
        </span>
      </div>
    </div>
  );
}
