// ===========================================
// Barre de Collaboration (US-030, US-031)
// Regroupe les indicateurs de connexion et collaborateurs
// ===========================================

import { cn } from '../../lib/utils';
import { ConnectionStatus, deriveConnectionState, type ConnectionState } from './ConnectionStatus';
import { CollaboratorAvatars } from './CollaboratorAvatars';
import type { CollaboratorInfo } from '../../hooks/useCollaboration';

interface CollaborationBarProps {
  /** État de connexion au serveur */
  isConnected: boolean;
  /** État de synchronisation du document */
  isSynced: boolean;
  /** Liste des collaborateurs */
  collaborators: CollaboratorInfo[];
  /** Classes CSS additionnelles */
  className?: string;
}

export function CollaborationBar({
  isConnected,
  isSynced,
  collaborators,
  className,
}: CollaborationBarProps) {
  const connectionState = deriveConnectionState(isConnected, isSynced);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-2',
        className
      )}
    >
      {/* Avatars des collaborateurs */}
      <CollaboratorAvatars collaborators={collaborators} />

      {/* Séparateur si des collaborateurs sont présents */}
      {collaborators.length > 0 && (
        <div className="h-4 w-px bg-border" />
      )}

      {/* Indicateur de connexion */}
      <ConnectionStatus
        state={connectionState}
        showLabel={!isConnected || !isSynced}
      />
    </div>
  );
}
