"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Profile, 
  ProfileAccess, 
  AccessRequest,
  getProfileAccess, 
  addProfileAccess, 
  removeProfileAccess, 
  updateProfileAccessRole,
  getAccessRequestsForProfile,
  approveAccessRequest,
  denyAccessRequest
} from "@/lib/db";
import { Shield, UserPlus, Trash2, X, Users, Crown, Bell, Check, XCircle, Loader2 } from "lucide-react";

interface AccessManagerProps {
  profile: Profile;
  currentUserEmail: string;
}

type TabType = 'users' | 'requests';

export default function AccessManager({ profile, currentUserEmail }: AccessManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('requests');
  const [accessList, setAccessList] = useState<ProfileAccess[]>([]);
  const [requestsList, setRequestsList] = useState<AccessRequest[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<'editor' | 'viewer'>('viewer');
  
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [accessData, requestsData] = await Promise.all([
      getProfileAccess(profile.id),
      getAccessRequestsForProfile(profile.id)
    ]);
    setAccessList(accessData);
    setRequestsList(requestsData.filter(r => r.status === 'pending')); // only show pending here
  }, [profile.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
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
    await loadData();
    setIsLoading(false);
  };

  const handleRemoveAccess = async (accessId: string) => {
    setActionLoadingId(accessId);
    await removeProfileAccess(accessId);
    await loadData();
    setActionLoadingId(null);
  };

  const handleRoleChange = async (accessId: string, role: 'editor' | 'viewer') => {
    setActionLoadingId(accessId);
    await updateProfileAccessRole(accessId, role);
    await loadData();
    setActionLoadingId(null);
  };

  const handleApproveRequest = async (requestId: string) => {
    setActionLoadingId(requestId);
    await approveAccessRequest(requestId);
    await loadData();
    setActionLoadingId(null);
  };

  const handleDenyRequest = async (requestId: string) => {
    setActionLoadingId(requestId);
    await denyAccessRequest(requestId);
    await loadData();
    setActionLoadingId(null);
  };

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
      <div className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden min-h-[50vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Gestione Profilo</h3>
              <p className="text-xs text-muted-foreground">Admin: {currentUserEmail}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/30">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 text-xs uppercase tracking-widest font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === 'requests' 
                ? 'bg-primary/5 text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:bg-muted/10'
            }`}
          >
            <Bell size={14} />
            Richieste
            {requestsList.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {requestsList.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 text-xs uppercase tracking-widest font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === 'users' 
                ? 'bg-primary/5 text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:bg-muted/10'
            }`}
          >
            <Users size={14} />
            Utenti
          </button>
        </div>

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="flex-1 overflow-y-auto divide-y divide-border/20">
            {requestsList.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                <Bell size={24} className="mb-3 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Nessuna richiesta in sospeso</p>
                <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">
                  Quando qualcuno scannerizza il QR e chiede l'accesso, apparirà qui.
                </p>
              </div>
            ) : (
              requestsList.map((req) => (
                <div key={req.id} className="p-5 flex flex-col gap-3 hover:bg-muted/5 transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium text-foreground">{req.requester_name}</p>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{req.requester_email}</p>
                    {req.message && (
                      <div className="mt-2 text-xs text-foreground/80 bg-muted/30 p-2.5 rounded-lg border border-border/40 font-serif italic relative">
                        &quot;{req.message}&quot;
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => handleDenyRequest(req.id)}
                      disabled={actionLoadingId === req.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 text-red-600 border border-red-100 text-xs font-medium uppercase tracking-wider hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {actionLoadingId === req.id ? <Loader2 size={14} className="animate-spin" /> : <><XCircle size={14} /> Rifiuta</>}
                    </button>
                    <button
                      onClick={() => handleApproveRequest(req.id)}
                      disabled={actionLoadingId === req.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200 text-xs font-medium uppercase tracking-wider hover:bg-green-100 shadow-sm transition-all disabled:opacity-50"
                    >
                      {actionLoadingId === req.id ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Approva</>}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Add user toggle */}
            <div className="p-3 border-b border-border/30 bg-muted/10">
              {showAddForm ? (
                 <div className="p-3 bg-white rounded-xl border border-border/50 shadow-sm animate-scale-in">
                 <div className="flex justify-between items-center mb-3">
                   <h4 className="text-xs uppercase tracking-widest font-medium">Invita Utente</h4>
                   <button onClick={() => setShowAddForm(false)} className="text-muted-foreground"><X size={14} /></button>
                 </div>
                 <div className="flex flex-col gap-3">
                   <input
                     type="email"
                     value={newEmail}
                     onChange={(e) => setNewEmail(e.target.value)}
                     placeholder="Email utente"
                     className="w-full bg-muted/20 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                   />
                   <div className="flex gap-2">
                     <select
                       value={newRole}
                       onChange={(e) => setNewRole(e.target.value as 'editor' | 'viewer')}
                       className="flex-1 bg-muted/20 border border-border/50 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                     >
                       <option value="viewer">Solo visualizzazione</option>
                       <option value="editor">Può caricare media</option>
                     </select>
                     <button
                       onClick={handleAddAccess}
                       disabled={!newEmail.trim() || isLoading}
                       className="bg-primary text-white px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-medium disabled:opacity-40"
                     >
                       Aggiungi
                     </button>
                   </div>
                 </div>
               </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest bg-white border border-border/60 hover:border-primary/40 rounded-xl transition-all text-primary shadow-sm"
                >
                  <UserPlus size={14} /> Aggiungi Direttamente
                </button>
              )}
            </div>

            {/* List */}
            <div className="divide-y divide-border/20 flex-1">
              {accessList.map((access) => (
                <div key={access.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/5 transition-colors">
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
                      <span className={`inline-block text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 border ${getRoleColor(access.role)} border-current/20`}>
                        {getRoleLabel(access.role)}
                      </span>
                    </div>
                  </div>

                  {access.role !== 'owner' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <select
                        disabled={actionLoadingId === access.id}
                        value={access.role}
                        onChange={(e) => handleRoleChange(access.id, e.target.value as 'editor' | 'viewer')}
                        className="text-[11px] bg-transparent border border-border/40 rounded-lg px-1.5 py-1 focus:outline-none uppercase font-medium disabled:opacity-50"
                      >
                        <option value="viewer">Visitatore</option>
                        <option value="editor">Editor</option>
                      </select>
                      <button
                        disabled={actionLoadingId === access.id}
                        onClick={() => handleRemoveAccess(access.id)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1.5 disabled:opacity-50"
                      >
                        {actionLoadingId === access.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
