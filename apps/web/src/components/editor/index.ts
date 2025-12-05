// ===========================================
// Editor Components Index
// ===========================================

export { NoteEditor, NoteEditorLegacy } from './NoteEditor';
export { CollaborativeEditor } from './CollaborativeEditor';
export { CollaboratorList, CollaboratorCursor } from './CollaboratorList';
export { EditorToolbar } from './EditorToolbar';

// Configuration de l'éditeur (US-022)
export {
  createEditorExtensions,
  createEditorProps,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_EDITOR_OPTIONS,
  DEFAULT_EDITOR_PROPS,
  // Presets
  MINIMAL_PRESET,
  STANDARD_PRESET,
  TECHNICAL_PRESET,
  DOCUMENTATION_PRESET,
  // Types
  type EditorFeatureFlags,
  type EditorConfigOptions,
  type EditorViewProps,
} from './EditorConfig';
