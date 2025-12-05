// ===========================================
// Constantes pour les Callouts (US-015)
// Types, icônes et couleurs Obsidian-style
// ===========================================

export type CalloutType =
  | 'note'
  | 'abstract'
  | 'info'
  | 'todo'
  | 'tip'
  | 'success'
  | 'question'
  | 'warning'
  | 'failure'
  | 'danger'
  | 'bug'
  | 'example'
  | 'quote';

// Alias pour les types (compatibilité Obsidian)
export const CALLOUT_ALIASES: Record<string, CalloutType> = {
  summary: 'abstract',
  tldr: 'abstract',
  hint: 'tip',
  important: 'tip',
  check: 'success',
  done: 'success',
  help: 'question',
  faq: 'question',
  caution: 'warning',
  attention: 'warning',
  fail: 'failure',
  missing: 'failure',
  error: 'danger',
  cite: 'quote',
};

// Résolution du type avec alias
export function resolveCalloutType(input: string): CalloutType {
  const normalized = input.toLowerCase().trim();
  return CALLOUT_ALIASES[normalized] || (normalized as CalloutType) || 'note';
}

// Icônes SVG pour chaque type (paths pour une viewBox 24x24)
export const CALLOUT_ICONS: Record<CalloutType, string> = {
  note: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  abstract: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  todo: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  tip: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  question: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  failure: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  danger: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  bug: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222',
  example: 'M4 6h16M4 10h16M4 14h16M4 18h16',
  quote: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
};

// Couleurs Tailwind pour chaque type (bg, border, text pour icône)
export interface CalloutColors {
  bg: string;
  border: string;
  icon: string;
  title: string;
}

export const CALLOUT_COLORS: Record<CalloutType, CalloutColors> = {
  note: {
    bg: 'bg-slate-50 dark:bg-slate-900/50',
    border: 'border-slate-300 dark:border-slate-700',
    icon: 'text-slate-500',
    title: 'text-slate-700 dark:text-slate-300',
  },
  abstract: {
    bg: 'bg-cyan-50 dark:bg-cyan-900/30',
    border: 'border-cyan-300 dark:border-cyan-800',
    icon: 'text-cyan-500',
    title: 'text-cyan-700 dark:text-cyan-300',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-300 dark:border-blue-800',
    icon: 'text-blue-500',
    title: 'text-blue-700 dark:text-blue-300',
  },
  todo: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-300 dark:border-blue-800',
    icon: 'text-blue-500',
    title: 'text-blue-700 dark:text-blue-300',
  },
  tip: {
    bg: 'bg-teal-50 dark:bg-teal-900/30',
    border: 'border-teal-300 dark:border-teal-800',
    icon: 'text-teal-500',
    title: 'text-teal-700 dark:text-teal-300',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    border: 'border-green-300 dark:border-green-800',
    icon: 'text-green-500',
    title: 'text-green-700 dark:text-green-300',
  },
  question: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    border: 'border-amber-300 dark:border-amber-800',
    icon: 'text-amber-500',
    title: 'text-amber-700 dark:text-amber-300',
  },
  warning: {
    bg: 'bg-orange-50 dark:bg-orange-900/30',
    border: 'border-orange-300 dark:border-orange-800',
    icon: 'text-orange-500',
    title: 'text-orange-700 dark:text-orange-300',
  },
  failure: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-300 dark:border-red-800',
    icon: 'text-red-400',
    title: 'text-red-700 dark:text-red-300',
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-400 dark:border-red-700',
    icon: 'text-red-500',
    title: 'text-red-700 dark:text-red-300',
  },
  bug: {
    bg: 'bg-rose-50 dark:bg-rose-900/30',
    border: 'border-rose-300 dark:border-rose-800',
    icon: 'text-rose-500',
    title: 'text-rose-700 dark:text-rose-300',
  },
  example: {
    bg: 'bg-violet-50 dark:bg-violet-900/30',
    border: 'border-violet-300 dark:border-violet-800',
    icon: 'text-violet-500',
    title: 'text-violet-700 dark:text-violet-300',
  },
  quote: {
    bg: 'bg-gray-50 dark:bg-gray-900/50',
    border: 'border-gray-300 dark:border-gray-700',
    icon: 'text-gray-500',
    title: 'text-gray-700 dark:text-gray-300',
  },
};

// Labels traduits pour l'UI
export const CALLOUT_LABELS: Record<CalloutType, string> = {
  note: 'Note',
  abstract: 'Résumé',
  info: 'Info',
  todo: 'À faire',
  tip: 'Astuce',
  success: 'Succès',
  question: 'Question',
  warning: 'Attention',
  failure: 'Échec',
  danger: 'Danger',
  bug: 'Bug',
  example: 'Exemple',
  quote: 'Citation',
};
