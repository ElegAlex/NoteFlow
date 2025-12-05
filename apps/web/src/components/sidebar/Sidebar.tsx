// ===========================================
// Composant Sidebar - Arborescence des dossiers
// US-007: Drag & Drop pour réorganisation
// ===========================================

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useFoldersStore } from '../../stores/folders';
import { useNotesStore } from '../../stores/notes';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { toast } from '../ui/Toaster';
import { cn } from '../../lib/utils';
import type { FolderTreeNode } from '@collabnotes/types';

// ===========================================
// Types pour Drag & Drop
// ===========================================

type DragItemType = 'folder' | 'note';

interface DragItem {
  type: DragItemType;
  id: string;
  name: string;
  parentId?: string | null;
}

// ===========================================
// Composants Draggable/Droppable
// ===========================================

interface DraggableItemProps {
  id: string;
  type: DragItemType;
  name: string;
  parentId?: string | null;
  children: React.ReactNode;
}

function DraggableItem({ id, type, name, parentId, children }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${type}:${id}`,
    data: { type, id, name, parentId } as DragItem,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(isDragging && 'opacity-50')}
    >
      {children}
    </div>
  );
}

interface DroppableFolderProps {
  id: string;
  children: React.ReactNode;
  isOver?: boolean;
}

function DroppableFolder({ id, children, isOver }: DroppableFolderProps) {
  const { setNodeRef, isOver: isOverCurrent } = useDroppable({
    id: `folder:${id}`,
    data: { type: 'folder', id },
  });

  const showDropIndicator = isOver || isOverCurrent;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'transition-colors rounded-md',
        showDropIndicator && 'bg-primary/10 ring-2 ring-primary/50'
      )}
    >
      {children}
    </div>
  );
}

// ===========================================
// Composant Principal
// ===========================================

export function Sidebar() {
  const navigate = useNavigate();
  const {
    tree,
    expandedFolders,
    selectedFolderId,
    isLoading,
    fetchTree,
    toggleFolder,
    selectFolder,
    createFolder,
    moveFolder,
    moveNote,
  } = useFoldersStore();

  const { createNote } = useNotesStore();

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [parentFolderForNew, setParentFolderForNew] = useState<string | null>(null);

  // US-007: État du drag
  const [activeItem, setActiveItem] = useState<DragItem | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Sensors pour le drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Évite les drags accidentels
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await createFolder(newFolderName, parentFolderForNew);
      setNewFolderName('');
      setIsCreatingFolder(false);
      setParentFolderForNew(null);
      toast.success('Dossier créé');
    } catch {
      toast.error('Erreur lors de la création');
    }
  };

  const handleCreateNote = async (folderId: string | null) => {
    try {
      const note = await createNote({
        title: 'Sans titre',
        folderId: folderId || undefined,
      });
      navigate(`/notes/${note.id}`);
    } catch {
      toast.error('Erreur lors de la création');
    }
  };

  // ===========================================
  // Handlers Drag & Drop
  // ===========================================

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragItem;
    setActiveItem(data);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id as string | null;
    setOverId(overId);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveItem(null);
    setOverId(null);

    if (!over) return;

    const draggedItem = active.data.current as DragItem;
    const dropTarget = over.id as string;

    // Extraire l'ID du dossier cible
    const targetFolderId = dropTarget.startsWith('folder:')
      ? dropTarget.replace('folder:', '')
      : null;

    if (!targetFolderId) return;

    // Vérifier qu'on ne dépose pas un élément sur lui-même
    if (draggedItem.type === 'folder' && draggedItem.id === targetFolderId) {
      return;
    }

    // Vérifier qu'on ne dépose pas un dossier dans un de ses enfants
    if (draggedItem.type === 'folder') {
      const isDescendant = checkIsDescendant(tree, draggedItem.id, targetFolderId);
      if (isDescendant) {
        toast.error('Impossible de déplacer un dossier dans un de ses sous-dossiers');
        return;
      }
    }

    // Vérifier que la destination est différente
    if (draggedItem.parentId === targetFolderId) {
      return;
    }

    try {
      if (draggedItem.type === 'folder') {
        await moveFolder(draggedItem.id, targetFolderId);
        toast.success(`Dossier "${draggedItem.name}" déplacé`);
      } else {
        await moveNote(draggedItem.id, targetFolderId);
        toast.success(`Note "${draggedItem.name}" déplacée`);
      }
    } catch {
      toast.error('Erreur lors du déplacement');
    }
  }, [tree, moveFolder, moveNote]);

  // Vérifier si targetId est un descendant de folderId
  const checkIsDescendant = (nodes: FolderTreeNode[], folderId: string, targetId: string): boolean => {
    const findFolder = (nodes: FolderTreeNode[], id: string): FolderTreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findFolder(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const folder = findFolder(nodes, folderId);
    if (!folder?.children) return false;

    const checkChildren = (children: FolderTreeNode[]): boolean => {
      for (const child of children) {
        if (child.id === targetId) return true;
        if (child.children && checkChildren(child.children)) return true;
      }
      return false;
    };

    return checkChildren(folder.children);
  };

  // ===========================================
  // Rendu des nœuds
  // ===========================================

  const renderFolderNode = (node: FolderTreeNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedFolderId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isDropTarget = overId === `folder:${node.id}`;

    return (
      <DroppableFolder key={node.id} id={node.id} isOver={isDropTarget}>
        <DraggableItem
          id={node.id}
          type="folder"
          name={node.name}
          parentId={node.parentId}
        >
          <div
            className={cn(
              'group flex items-center gap-1 py-1 px-2 rounded-md cursor-pointer transition-colors',
              isSelected ? 'bg-muted' : 'hover:bg-muted/50'
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => selectFolder(node.id)}
          >
            {/* Expand/Collapse */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(node.id);
              }}
              className="h-4 w-4 flex items-center justify-center"
            >
              {hasChildren && (
                <svg
                  className={cn(
                    'h-3 w-3 transition-transform',
                    isExpanded && 'rotate-90'
                  )}
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
            </button>

            {/* Folder Icon */}
            <svg
              className="h-4 w-4 flex-shrink-0"
              style={{ color: node.color || 'currentColor' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isExpanded
                    ? 'M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z'
                    : 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'
                }
              />
            </svg>

            {/* Name */}
            <span className="flex-1 truncate text-sm">{node.name}</span>

            {/* Actions */}
            <div className="hidden group-hover:flex items-center gap-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateNote(node.id);
                }}
                className="h-5 w-5 rounded hover:bg-muted flex items-center justify-center"
                title="Nouvelle note"
              >
                <svg
                  className="h-3 w-3"
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
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setParentFolderForNew(node.id);
                  setIsCreatingFolder(true);
                }}
                className="h-5 w-5 rounded hover:bg-muted flex items-center justify-center"
                title="Nouveau sous-dossier"
              >
                <svg
                  className="h-3 w-3"
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
              </button>
            </div>

            {/* Note count */}
            {node.noteCount !== undefined && node.noteCount > 0 && (
              <span className="text-xs text-muted-foreground">{node.noteCount}</span>
            )}
          </div>
        </DraggableItem>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>
            {node.children!.map((child) => renderFolderNode(child, depth + 1))}
          </div>
        )}

        {/* Notes in folder */}
        {isExpanded && node.notes && node.notes.length > 0 && (
          <div>
            {node.notes.map((note) => (
              <DraggableItem
                key={note.id}
                id={note.id}
                type="note"
                name={note.title}
                parentId={node.id}
              >
                <div
                  onClick={() => navigate(`/notes/${note.id}`)}
                  className="flex items-center gap-2 py-1 px-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                  style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
                >
                  <svg
                    className="h-4 w-4 flex-shrink-0 text-muted-foreground"
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
                  <span className="truncate text-sm">{note.title}</span>
                </div>
              </DraggableItem>
            ))}
          </div>
        )}
      </DroppableFolder>
    );
  };

  // ===========================================
  // Overlay pendant le drag
  // ===========================================

  const renderDragOverlay = () => {
    if (!activeItem) return null;

    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-card border rounded-md shadow-lg">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={
              activeItem.type === 'folder'
                ? 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'
                : 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            }
          />
        </svg>
        <span className="text-sm font-medium">{activeItem.name}</span>
      </div>
    );
  };

  // ===========================================
  // Rendu principal
  // ===========================================

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size="sm" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Dossiers
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => {
              setParentFolderForNew(null);
              setIsCreatingFolder(true);
            }}
          >
            <svg
              className="h-4 w-4"
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
          </Button>
        </div>

        {/* New Folder Input */}
        {isCreatingFolder && (
          <div className="mb-2 px-2">
            <div className="flex gap-1">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nom du dossier"
                className="h-7 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder();
                  if (e.key === 'Escape') {
                    setIsCreatingFolder(false);
                    setNewFolderName('');
                  }
                }}
              />
              <Button
                size="sm"
                className="h-7"
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
              >
                OK
              </Button>
            </div>
          </div>
        )}

        {/* Folder Tree */}
        <div className="space-y-0.5">
          {tree.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2 py-4 text-center">
              Aucun dossier
            </p>
          ) : (
            tree.map((node) => renderFolderNode(node))
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {renderDragOverlay()}
      </DragOverlay>
    </DndContext>
  );
}
