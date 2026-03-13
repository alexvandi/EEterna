"use client";

import { useEffect, useState, use } from "react";
import { Profile, getProfileByQrId } from "@/lib/db";
import MemorialProfile from "@/components/MemorialProfile";
import RegistrationForm from "@/components/RegistrationForm";
import AccessManager from "@/components/AccessManager";
import { Loader2, Settings } from "lucide-react";

export default function QRProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAccessManager, setShowAccessManager] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [showOwnerLogin, setShowOwnerLogin] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const data = await getProfileByQrId(id);
      setProfile(data);
      setLoading(false);
    };
    loadProfile();
  }, [id]);

  const handleRegistered = (newProfile: Profile) => {
    setProfile(newProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-sm text-muted-foreground tracking-widest uppercase">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <RegistrationForm qrId={id} onRegistered={handleRegistered} />;
  }

  return (
    <div className="relative">
      <MemorialProfile profile={profile} />

      {/* Owner settings button */}
      {profile.owner_email && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => {
              if (ownerEmail && ownerEmail === profile.owner_email) {
                setShowAccessManager(!showAccessManager);
              } else {
                setShowOwnerLogin(true);
              }
            }}
            className="w-12 h-12 rounded-full bg-white shadow-lg border border-border/40 flex items-center justify-center hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Settings size={20} className="text-foreground/70" />
          </button>
        </div>
      )}

      {/* Owner login modal */}
      {showOwnerLogin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
            <h3 className="text-lg font-serif font-medium text-foreground mb-2">Accesso Proprietario</h3>
            <p className="text-sm text-muted-foreground mb-4">Inserisci la tua email per gestire gli accessi</p>
            <input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="La tua email"
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowOwnerLogin(false)}
                className="flex-1 bg-muted/50 text-foreground py-2.5 rounded-xl text-sm uppercase tracking-widest font-medium"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  if (ownerEmail === profile.owner_email) {
                    setShowOwnerLogin(false);
                    setShowAccessManager(true);
                  } else {
                    alert("Email non autorizzata.");
                  }
                }}
                className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm uppercase tracking-widest font-medium"
              >
                Accedi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Access Manager panel */}
      {showAccessManager && ownerEmail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center animate-fade-in">
          <div className="bg-background w-full max-w-lg rounded-t-3xl md:rounded-2xl max-h-[80vh] overflow-y-auto shadow-xl animate-slide-up">
            <div className="sticky top-0 bg-background/90 backdrop-blur-sm p-4 flex justify-end">
              <button
                onClick={() => setShowAccessManager(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            <AccessManager profile={profile} currentUserEmail={ownerEmail} />
          </div>
        </div>
      )}
    </div>
  );
}
