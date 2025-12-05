// ===========================================
// Page Administration (US-110 à US-114)
// US-053: Interface admin utilisateurs
// ===========================================

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { toast } from '../components/ui/Toaster';
import type { User, Role } from '@collabnotes/types';

type Tab = 'users' | 'roles' | 'audit' | 'system';

// Formater la date de dernière connexion
function formatLastLogin(dateString: string | null | undefined): string {
  if (!dateString) return 'Jamais';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 5) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR');
}

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
      loadRoles();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ items: User[]; total: number }>('/users');
      setUsers(response.data.items);
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await api.get<{ roles: Role[] }>('/users/roles');
      setRoles(response.data.roles);
    } catch {
      // Silently fail - roles dropdown won't work but page still usable
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await api.patch(`/users/${userId}`, { isActive: !isActive });
      toast.success(`Utilisateur ${isActive ? 'désactivé' : 'activé'}`);
      loadUsers();
    } catch {
      toast.error('Erreur lors de la modification');
    }
  };

  const changeUserRole = async (userId: string, roleId: string) => {
    try {
      await api.patch(`/users/${userId}`, { roleId });
      toast.success('Rôle modifié');
      loadUsers();
    } catch {
      toast.error('Erreur lors du changement de rôle');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Administration</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        {[
          { id: 'users' as Tab, label: 'Utilisateurs' },
          { id: 'roles' as Tab, label: 'Rôles' },
          { id: 'audit' as Tab, label: 'Audit' },
          { id: 'system' as Tab, label: 'Système' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">
                        Utilisateur
                      </th>
                      <th className="text-left py-3 px-4 font-medium">Email</th>
                      <th className="text-left py-3 px-4 font-medium">Rôle</th>
                      <th className="text-left py-3 px-4 font-medium">Statut</th>
                      <th className="text-left py-3 px-4 font-medium">
                        Dernière connexion
                      </th>
                      <th className="text-right py-3 px-4 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">
                              {user.displayName || user.username}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              @{user.username}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {user.email || '-'}
                        </td>
                        <td className="py-3 px-4">
                          {roles.length > 0 ? (
                            <select
                              value={user.role?.id || ''}
                              onChange={(e) => changeUserRole(user.id, e.target.value)}
                              className="text-xs px-2 py-1 rounded border bg-background"
                            >
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted">
                              {user.role?.name || 'User'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              user.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatLastLogin(user.lastLoginAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toggleUserStatus(user.id, user.isActive)
                            }
                          >
                            {user.isActive ? 'Désactiver' : 'Activer'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun utilisateur trouvé
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'roles' && (
        <Card>
          <CardHeader>
            <CardTitle>Gestion des rôles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              La gestion des rôles sera disponible prochainement.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'audit' && (
        <Card>
          <CardHeader>
            <CardTitle>Journal d'audit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Le journal d'audit sera disponible prochainement.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'system' && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration système</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              La configuration système sera disponible prochainement.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
