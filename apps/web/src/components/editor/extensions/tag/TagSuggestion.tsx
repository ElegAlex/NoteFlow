// ===========================================
// Composant suggestion pour tags (US-017)
// Autocomplétion après #
// ===========================================

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export interface TagItem {
  id: string;
  name: string;
  color: string | null;
  noteCount: number;
}

interface TagSuggestionListProps {
  items: TagItem[];
  command: (item: { id: string; name: string }) => void;
}

export interface TagSuggestionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const TagSuggestionList = forwardRef<TagSuggestionListRef, TagSuggestionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          return true;
        }

        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }

        if (event.key === 'Enter') {
          const item = items[selectedIndex];
          if (item) {
            command({ id: item.id, name: item.name });
          }
          return true;
        }

        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="tag-suggestion-empty px-3 py-2 text-sm text-muted-foreground">
          Aucun tag trouvé. Appuyez sur Entrée pour créer.
        </div>
      );
    }

    return (
      <div className="tag-suggestion-list">
        {items.map((item, index) => (
          <button
            key={item.id}
            className={`
              tag-suggestion-item w-full text-left px-3 py-2 flex items-center gap-2
              hover:bg-muted transition-colors
              ${index === selectedIndex ? 'bg-muted' : ''}
            `}
            onClick={() => command({ id: item.id, name: item.name })}
          >
            {/* Color indicator */}
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: item.color || '#6b7280',
              }}
            />
            {/* Tag name */}
            <span className="flex-1 text-sm font-medium">#{item.name}</span>
            {/* Note count */}
            <span className="text-xs text-muted-foreground">{item.noteCount}</span>
          </button>
        ))}
      </div>
    );
  }
);

TagSuggestionList.displayName = 'TagSuggestionList';
