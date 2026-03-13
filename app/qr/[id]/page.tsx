"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProfileByQrId, DeceasedProfile } from "@/lib/storage";
import RegistrationForm from "@/components/RegistrationForm";
import MemorialProfile from "@/components/MemorialProfile";

export default function QrPage() {
    const params = useParams();
    const qrId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<DeceasedProfile | null>(null);

    useEffect(() => {
        // Simuliamo un brevissimo ritardo di caricamento per l'esperienza utente
        const timer = setTimeout(() => {
            const existingProfile = getProfileByQrId(qrId);
            setProfile(existingProfile);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [qrId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-primary animate-spin"></div>
                <p className="mt-4 text-muted-foreground font-serif italic text-sm">Caricamento in corso...</p>
            </div>
        );
    }

    // Se il profilo non esiste per questo QR ID, mostra il form di registrazione
    if (!profile) {
        return <RegistrationForm qrId={qrId} onRegistered={setProfile} />;
    }

    // Se il profilo esiste, mostra il profilo commemorativo
    return <MemorialProfile profile={profile} />;
}
