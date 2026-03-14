"use client";

import { useEffect, useState, use } from "react";
import { Profile, getProfileByQrId, checkUserAccess, getVisitorEmail, getQrCode } from "@/lib/db";
import MemorialProfile from "@/components/MemorialProfile";
import RegistrationForm from "@/components/RegistrationForm";
import AccessManager from "@/components/AccessManager";
import AccessRequestButton from "@/components/AccessRequestButton";
import { Loader2, Settings, QrCode as QrIcon } from "lucide-react";
import Link from "next/link";

export default function QRProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isValidQr, setIsValidQr] = useState<boolean | null>(null);
  
  // States for owner access
  const [showAccessManager, setShowAccessManager] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [showOwnerLogin, setShowOwnerLogin] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      
      // 1. Verify if the QR is in our database at all
      const qrData = await getQrCode(id);
      if (!qrData) {
        setIsValidQr(false);
        setLoading(false);
        return;
      }
      setIsValidQr(true);

      // 2. Fetch the profile if registered
      const data = await getProfileByQrId(id);
      setProfile(data);

      if (data) {
        // 3. Check access
        const visitorEmail = getVisitorEmail();
        if (visitorEmail) {
          const access = await checkUserAccess(data.id, visitorEmail);
          if (access) {
            setHasAccess(true);
          }
        }
      }
      setLoading(false);
    };
    
    loadProfile();
  }, [id]);

  const handleRegistered = (newProfile: Profile) => {
    setProfile(newProfile);
    // Since they just created it, give them access instantly (they are owner)
    setHasAccess(true);
    // Ask them to login to settings right away to save email
    setShowOwnerLogin(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium">Apertura memoriale...</p>
        </div>
      </div>
    );
  }

  // QR non esistente nel database
  if (isValidQr === false) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <QrIcon size={24} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-serif text-foreground mb-3">Codice Non Valido</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm">
          Questo codice QR non appartiene al network Eterna o non è stato attivato correttamente.
        </p>
        <Link href="/" className="bg-primary text-white px-6 py-3 rounded-xl uppercase tracking-widest text-xs font-medium">
          Torna alla Home
        </Link>
      </div>
    );
  }

  // Se il QR è valido ma non ha ancora un profilo associato -> Registrazione
  if (!profile) {
    return <RegistrationForm qrId={id} onRegistered={handleRegistered} />;
  }

  // Profilo esistente
  return (
    <div className="relative">
      <MemorialProfile profile={profile} hasAccess={hasAccess}>
        {hasAccess ? (
          // Content for authorized users (Tabs)
          <div className="w-full">
            {/* We dynamically import ProfileTabs only if they have access to avoid loading data unnecessarily */}
            <div className="animate-fade-in mt-4">
               {/* 
                 For simplicity here we just use dynamic import under the hood
                 since ProfileTabs is a separate component. 
               */}
               <ProfileTabsLoader profile={profile} />
            </div>
          </div>
        ) : (
          // Content for unauthorized users (Lock screen)
          <AccessRequestButton profileId={profile.id} />
        )}
      </MemorialProfile>

      {/* Owner settings gear button */}
      {profile.owner_email && (
        <div className="fixed bottom-6 right-6 z-40 animate-fade-in">
          <button
            onClick={() => {
              if (ownerEmail && ownerEmail === profile.owner_email) {
                setShowAccessManager(!showAccessManager);
              } else {
                setShowOwnerLogin(true);
              }
            }}
            className="w-12 h-12 rounded-full bg-white shadow-lg border border-border/40 flex items-center justify-center hover:shadow-xl hover:-translate-y-0.5 transition-all text-foreground/60 hover:text-primary"
          >
            <Settings size={20} />
          </button>
        </div>
      )}

      {/* Owner login modal */}
      {showOwnerLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in relative">
            <button 
              onClick={() => setShowOwnerLogin(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-serif font-medium text-foreground mb-2">Accesso Gestore</h3>
            <p className="text-sm text-muted-foreground mb-4">Inserisci l'email del gestore per amministrare questo profilo.</p>
            <input
              type="email"
              required
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="La tua email"
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && ownerEmail) {
                  const checkLogin = () => {
                    if (ownerEmail === profile.owner_email) {
                      localStorage.setItem('eterna_visitor_email', ownerEmail);
                      setHasAccess(true);
                      setShowOwnerLogin(false);
                      setShowAccessManager(true);
                    } else {
                      alert("Email non autorizzata.");
                    }
                  }
                  checkLogin();
                }
              }}
            />
            <button
              disabled={!ownerEmail}
              onClick={() => {
                if (ownerEmail === profile.owner_email) {
                  // Save their email so they get full access
                  localStorage.setItem('eterna_visitor_email', ownerEmail);
                  setHasAccess(true);
                  setShowOwnerLogin(false);
                  setShowAccessManager(true);
                } else {
                  alert("Email non autorizzata. Riprova.");
                }
              }}
              className="w-full bg-primary text-white py-3 rounded-xl text-sm uppercase tracking-widest font-medium disabled:opacity-50"
            >
              Accedi
            </button>
          </div>
        </div>
      )}

      {/* Access Manager panel */}
      {showAccessManager && ownerEmail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center animate-fade-in">
          <div className="bg-background w-full max-w-lg rounded-t-3xl md:rounded-2xl max-h-[85vh] overflow-hidden shadow-xl animate-slide-up flex flex-col">
            <div className="bg-background/90 backdrop-blur-sm p-4 flex justify-end shrink-0 border-b border-border/30">
              <button
                onClick={() => setShowAccessManager(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 bg-muted/50 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto w-full">
              <AccessManager profile={profile} currentUserEmail={ownerEmail} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper per caricare il componente Tabs in ritardo se necessario
import ProfileTabs from "@/components/ProfileTabs";
import { X } from "lucide-react";

function ProfileTabsLoader({ profile }: { profile: Profile }) {
  return <ProfileTabs profile={profile} />;
}
