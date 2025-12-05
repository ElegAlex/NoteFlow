// ===========================================
// Indicateur de Statut de Connexion (US-030)
// Affiche l'état de la connexion WebSocket collaborative
// ===========================================

import { cn } from '../../lib/utils';

export type ConnectionState = 'connecting' | 'connected' | 'syncing' | 'synced' | 'disconnected';

interface ConnectionStatusProps {
  /** État actuel de la connexion */
  state: ConnectionState;
  /** Afficher le texte du statut */
  showLabel?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

const STATUS_CONFIG: Record<ConnectionState, {
  color: string;
  bgColor: string;
  label: string;
  icon: string;
  pulse?: boolean;
}> = {
  connecting: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500',
    label: 'Connexion...',
    icon: '◌',
    pulse: true,
  },
  connected: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    label: 'Connecté',
    icon: '◐',
    pulse: true,
  },
  syncing: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    label: 'Synchronisation...',
    icon: '↻',
    pulse: true,
  },
  synced: {
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    label: 'Synchronisé',
    icon: '●',
  },
  disconnected: {
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    label: 'Déconnecté',
    icon: '○',
  },
};

export function ConnectionStatus({
  state,
  showLabel = false,
  className
}: ConnectionStatusProps) {
  const config = STATUS_CONFIG[state];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5',
        className
      )}
      title={config.label}
    >
      {/* Indicateur visuel avec point coloré */}
      <span className="relative flex h-2.5 w-2.5">
        {config.pulse && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              config.bgColor
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2.5 w-2.5',
            config.bgColor
          )}
        />
      </span>

      {/* Label optionnel */}
      {showLabel && (
        <span className={cn('text-xs font-medium', config.color)}>
          {config.label}
        </span>
      )}
    </div>
  );
}

// Hook utilitaire pour dériver l'état de connexion
export function deriveConnectionState(
  isConnected: boolean,
  isSynced: boolean
): ConnectionState {
  if (!isConnected) return 'disconnected';
  if (isSynced) return 'synced';
  return 'syncing';
}
