// ===========================================
// Node View React pour les Embeds (US-040)
// Affiche un aperçu de la note intégrée
// ===========================================

import { useState, useEffect, useCallback } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

interface EmbeddedNote {
  title: string;
  content: string;
  slug: string;
}

export function EmbedNodeView({ node }: NodeViewProps) {
  const { title } = node.attrs;
  const [note, setNote] = useState<EmbeddedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  // Charger la note
  useEffect(() => {
    async function loadNote() {
      if (!title) {
        setError('Titre manquant');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Rechercher la note par titre
        const response = await fetch(
          `/api/v1/notes/search?q=${encodeURIComponent(title)}&limit=1`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const data = await response.json();
          const matchingNote = data.notes?.find(
            (n: { title: string }) =>
              n.title.toLowerCase() === title.toLowerCase()
          );

          if (matchingNote) {
            // Récupérer le contenu complet
            const noteResponse = await fetch(
              `/api/v1/notes/${matchingNote.slug}`,
              { credentials: 'include' }
            );

            if (noteResponse.ok) {
              const noteData = await noteResponse.json();
              setNote({
                title: noteData.title,
                content: noteData.content,
                slug: noteData.slug,
              });
            } else {
              setError('Impossible de charger la note');
            }
          } else {
            setError('Note introuvable');
          }
        } else {
          setError('Erreur de recherche');
        }
      } catch (err) {
        console.error('Failed to load embedded note:', err);
        setError('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }

    loadNote();
  }, [title]);

  // Naviguer vers la note
  const handleNavigate = useCallback(() => {
    if (note?.slug) {
      window.location.href = `/notes/${note.slug}`;
    }
  }, [note]);

  // Extraire un aperçu du contenu HTML
  const getPreview = useCallback((html: string, maxLength = 300) => {
    // Créer un élément temporaire pour parser le HTML
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }, []);

  return (
    <NodeViewWrapper className="embed-wrapper my-4">
      <div className="embed-block border border-border rounded-lg overflow-hidden bg-muted/30 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-2">
            {/* Icon */}
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>

            {/* Title */}
            {loading ? (
              <span className="text-sm text-muted-foreground animate-pulse">
                Chargement...
              </span>
            ) : error ? (
              <span className="text-sm text-destructive flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {title} - {error}
              </span>
            ) : (
              <button
                onClick={handleNavigate}
                className="text-sm font-medium text-primary hover:underline cursor-pointer"
              >
                {note?.title || title}
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded hover:bg-muted text-muted-foreground"
              title={collapsed ? 'Déplier' : 'Replier'}
            >
              <svg
                className={`w-4 h-4 transition-transform ${collapsed ? '-rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Open in new window */}
            {note && (
              <button
                onClick={handleNavigate}
                className="p-1 rounded hover:bg-muted text-muted-foreground"
                title="Ouvrir la note"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {!collapsed && (
          <div className="p-4">
            {loading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            ) : error ? (
              <div className="text-sm text-muted-foreground italic">
                {error === 'Note introuvable' ? (
                  <span>
                    La note "{title}" n'existe pas encore.{' '}
                    <button
                      onClick={() => {
                        if (window.confirm(`Créer la note "${title}" ?`)) {
                          fetch('/api/v1/notes', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ title, content: '' }),
                          })
                            .then((res) => res.json())
                            .then((newNote) => {
                              window.location.href = `/notes/${newNote.slug}`;
                            })
                            .catch(console.error);
                        }
                      }}
                      className="text-primary hover:underline"
                    >
                      Créer cette note
                    </button>
                  </span>
                ) : (
                  error
                )}
              </div>
            ) : note ? (
              <div
                className="prose prose-sm max-w-none text-foreground/80 line-clamp-6"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            ) : null}
          </div>
        )}

        {/* Footer indicator */}
        <div className="px-4 py-1.5 bg-muted/30 border-t border-border text-[10px] text-muted-foreground">
          Embed: ![[{title}]]
        </div>
      </div>
    </NodeViewWrapper>
  );
}
