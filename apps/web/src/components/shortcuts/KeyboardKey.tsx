// ===========================================
// Composant KeyboardKey - Affichage d'une touche
// ===========================================

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface KeyboardKeyProps {
  keyLabel: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Composant pour afficher une touche de clavier stylisée
 */
export const KeyboardKey = memo(function KeyboardKey({
  keyLabel,
  size = 'md',
  className,
}: KeyboardKeyProps) {
  // Déterminer si c'est un symbole (caractère unique) ou un label (mot)
  const isSymbol = keyLabel.length === 1;

  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center font-sans font-medium',
        'rounded border border-border bg-muted',
        'shadow-[0_1px_0_1px_hsl(var(--border))]',
        'select-none',
        {
          'min-w-5 h-5 px-1 text-xs': size === 'sm',
          'min-w-7 h-7 px-1.5 text-sm': size === 'md',
          'min-w-9 h-9 px-2 text-base': size === 'lg',
        },
        isSymbol ? 'font-mono' : 'tracking-wide',
        className
      )}
    >
      {keyLabel}
    </kbd>
  );
});
