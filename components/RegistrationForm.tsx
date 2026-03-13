"use client";

import { useState } from "react";
import { createProfile, DeceasedProfile } from "@/lib/storage";

interface RegistrationFormProps {
    qrId: string;
    onRegistered: (profile: DeceasedProfile) => void;
}

export default function RegistrationForm({ qrId, onRegistered }: RegistrationFormProps) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        birthDate: "",
        deathDate: "",
        epitaph: "",
        profileImage: "",
        backgroundImage: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            const newProfile = createProfile({
                qrId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                birthDate: formData.birthDate,
                deathDate: formData.deathDate,
                epitaph: formData.epitaph,
                profileImage: formData.profileImage || "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=256&h=256&auto=format&fit=crop", // placeholder
                backgroundImage: formData.backgroundImage || "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=1080&h=400&auto=format&fit=crop", // placeholder
            });
            onRegistered(newProfile);
            setIsLoading(false);
        }, 600);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center py-10 px-4 md:px-0 animate-fade-in relative z-10">
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/10 to-transparent -z-10" />

            <div className="w-full max-w-md bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/10 p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-foreground mb-2">Nuovo Ricordo</h2>
                    <p className="text-sm text-muted-foreground font-serif italic">
                        Configura il profilo dedicato per questo codice.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-foreground uppercase tracking-wider">Nome</label>
                            <input
                                required
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full bg-input/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                                placeholder="Es. Mario"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-foreground uppercase tracking-wider">Cognome</label>
                            <input
                                required
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full bg-input/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                                placeholder="Es. Rossi"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-foreground uppercase tracking-wider">Data di Nascita</label>
                            <input
                                type="date"
                                required
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleChange}
                                className="w-full bg-input/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-foreground uppercase tracking-wider">Data di Scomparsa</label>
                            <input
                                type="date"
                                required
                                name="deathDate"
                                value={formData.deathDate}
                                onChange={handleChange}
                                className="w-full bg-input/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-foreground uppercase tracking-wider">Epitaffio / Breve Biografia</label>
                        <textarea
                            required
                            name="epitaph"
                            value={formData.epitaph}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-input/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none text-foreground font-serif italic"
                            placeholder="Un pensiero da dedicare..."
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-foreground uppercase tracking-wider">URL Immagine Profilo (Opzionale)</label>
                        <input
                            type="url"
                            name="profileImage"
                            value={formData.profileImage}
                            onChange={handleChange}
                            className="w-full bg-input/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 mb-2">
                        <label className="text-xs font-medium text-foreground uppercase tracking-wider">URL Sfondo (Opzionale)</label>
                        <input
                            type="url"
                            name="backgroundImage"
                            value={formData.backgroundImage}
                            onChange={handleChange}
                            className="w-full bg-input/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                            placeholder="https://..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-primary-foreground py-3.5 rounded-md font-medium text-sm tracking-widest hover:bg-primary/90 transition-all duration-300 uppercase shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        {isLoading ? "Creazione in corso..." : "Crea Profilo"}
                    </button>
                </form>
            </div>
        </div>
    );
}
