"use client";

import { useState, useEffect, useCallback } from "react";
import { Profile, ProfileAccess, getProfileAccess, addProfileAccess, removeProfileAccess, updateProfileAccessRole } from "@/lib/db";
import { Shield, UserPlus, Trash2, ChevronDown, X, Users, Crown } from "lucide-react";

interface AccessManagerProps {
  profile: Profile;
  currentUserEmail: string;
}

export default function AccessManager({ profile, currentUserEmail }: AccessManagerProps) {
  const [accessList, setAccessList] = useState<ProfileAccess[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<'editor' | 'viewer'>('viewer');
  const [isLoading, setIsLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const loadAccess = useCallback(async () => {
    const data = await getProfileAccess(profile.id);
    setAccessList(data);
    const ownerAccess = data.find(a => a.user_email === currentUserEmail && a.role === 'owner');
    setIsOwner(!!ownerAccess || profile.owner_email === currentUserEmail);
  }, [profile.id, currentUserEmail, profile.owner_email]);

  useEffect(() => {
    loadAccess();
  }, [loadAccess]);

  const handleAddAccess = async () => {
    if (!newEmail.trim()) return;
    setIsLoading(true);
    await addProfileAccess({
      profile_id: profile.id,
      user_email: newEmail.trim(),
      role: newRole,
      granted_by: currentUserEmail,
    });
    setNewEmail("");
    setShowAddForm(false);
    await loadAccess();
    setIsLoading(false);
  };

  const handleRemoveAccess = async (accessId: string) => {
    await removeProfileAccess(accessId);
    await loadAccess();
  };

  const handleRoleChange = async (accessId: string, role: 'editor' | 'viewer') => {
    await updateProfileAccessRole(accessId, role);
    await loadAccess();
  };

  if (!isOwner) {
    return null;
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Proprietario';
      case 'editor': return 'Editor';
      case 'viewer': return 'Visitatore';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-amber-100 text-amber-700';
      case 'editor': return 'bg-blue-100 text-blue-700';
      case 'viewer': return 'bg-green-100 text-green-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pb-8 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Gestione Accessi</h3>
              <p className="text-xs text-muted-foreground">Decidi chi può vedere questo profilo</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
          >
            {showAddForm ? <X size={16} className="text-primary" /> : <UserPlus size={16} className="text-primary" />}
          </button>
        </div>

        {/* Add new access form */}
        {showAddForm && (
          <div className="p-4 bg-muted/20 border-b border-border/30 animate-scale-in">
            <div className="flex flex-col gap-3">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Email del nuovo utente"
                className="w-full bg-white border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="flex gap-2">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'editor' | 'viewer')}
                  className="flex-1 bg-white border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="viewer">Visitatore</option>
                  <option value="editor">Editor</option>
                </select>
                <button
                  onClick={handleAddAccess}
                  disabled={!newEmail.trim() || isLoading}
                  className="bg-primary text-white px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-medium disabled:opacity-40"
                >
                  Aggiungi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Access list */}
        <div className="divide-y divide-border/20">
          {accessList.length === 0 ? (
            <div className="p-8 text-center">
              <Users size={24} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nessun accesso configurato</p>
            </div>
          ) : (
            accessList.map((access) => (
              <div key={access.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                    {access.role === 'owner' ? (
                      <Crown size={14} className="text-amber-500" />
                    ) : (
                      <span className="text-xs font-medium text-foreground/60">
                        {access.user_email.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{access.user_email}</p>
                    <span className={`inline-block text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 ${getRoleColor(access.role)}`}>
                      {getRoleLabel(access.role)}
                    </span>
                  </div>
                </div>

                {access.role !== 'owner' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={access.role}
                      onChange={(e) => handleRoleChange(access.id, e.target.value as 'editor' | 'viewer')}
                      className="text-xs bg-transparent border border-border/40 rounded-lg px-2 py-1 focus:outline-none"
                    >
                      <option value="viewer">Visitatore</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button
                      onClick={() => handleRemoveAccess(access.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
