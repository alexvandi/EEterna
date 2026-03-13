"use client";

import { useState, useRef } from "react";
import { createProfile, uploadMediaFile, addProfileAccess, Profile } from "@/lib/db";
import { Upload, User, Calendar, FileText, Image as ImageIcon, Loader2 } from "lucide-react";

interface RegistrationFormProps {
  qrId: string;
  onRegistered: (profile: Profile) => void;
}

export default function RegistrationForm({ qrId, onRegistered }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    deathDate: "",
    epitaph: "",
    biography: "",
    ownerEmail: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>("");
  const [bgPreview, setBgPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleBgImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundImage(file);
      setBgPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload images first
      let profileImageUrl = "";
      let backgroundImageUrl = "";

      if (profileImage) {
        const url = await uploadMediaFile(profileImage, `profiles/${qrId}`);
        if (url) profileImageUrl = url;
      }

      if (backgroundImage) {
        const url = await uploadMediaFile(backgroundImage, `backgrounds/${qrId}`);
        if (url) backgroundImageUrl = url;
      }

      // Create the profile
      const newProfile = await createProfile({
        qr_id: qrId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        birth_date: formData.birthDate,
        death_date: formData.deathDate,
        epitaph: formData.epitaph,
        biography: formData.biography,
        profile_image_url: profileImageUrl,
        background_image_url: backgroundImageUrl,
        owner_email: formData.ownerEmail || undefined,
      });

      if (newProfile) {
        // If owner email provided, add as owner in access table
        if (formData.ownerEmail) {
          await addProfileAccess({
            profile_id: newProfile.id,
            user_email: formData.ownerEmail,
            role: 'owner',
          });
        }
        onRegistered(newProfile);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-8 px-4 animate-fade-in">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-primary" />
          </div>
          <h2 className="text-2xl font-serif text-foreground mb-2">Nuovo Memoriale</h2>
          <p className="text-sm text-muted-foreground font-serif italic">
            Configura il profilo per questo codice QR
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {s}
              </div>
              {s < 2 && <div className={`w-12 h-0.5 transition-all ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-border/40 p-6 space-y-5 animate-fade-in">
              <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-2">Informazioni Personali</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <User size={12} /> Nome
                  </label>
                  <input
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground transition-all"
                    placeholder="Es. Giovanni"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground uppercase tracking-wider">Cognome</label>
                  <input
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground transition-all"
                    placeholder="Es. Rossi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={12} /> Data di Nascita
                  </label>
                  <input
                    type="date"
                    required
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
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
                    className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground uppercase tracking-wider">Epitaffio</label>
                <textarea
                  name="epitaph"
                  value={formData.epitaph}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-foreground font-serif italic"
                  placeholder="Un pensiero da dedicare..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground uppercase tracking-wider">Biografia (Opzionale)</label>
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-foreground"
                  placeholder="Racconta la sua storia..."
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.firstName || !formData.lastName || !formData.birthDate || !formData.deathDate}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-medium text-sm tracking-widest uppercase shadow-md hover:shadow-lg transition-all disabled:opacity-40"
              >
                Continua
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-border/40 p-6 space-y-5 animate-fade-in">
              <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-2">Foto e Proprietà</h3>

              {/* Profile Image */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon size={12} /> Foto Profilo
                </label>
                <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImage} />
                <div
                  onClick={() => profileInputRef.current?.click()}
                  className="w-full h-32 bg-muted/20 border-2 border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-all overflow-hidden"
                >
                  {profilePreview ? (
                    <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload size={20} className="text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Carica foto profilo</span>
                    </>
                  )}
                </div>
              </div>

              {/* Background Image */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-foreground uppercase tracking-wider">Immagine di Sfondo</label>
                <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handleBgImage} />
                <div
                  onClick={() => bgInputRef.current?.click()}
                  className="w-full h-24 bg-muted/20 border-2 border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-all overflow-hidden"
                >
                  {bgPreview ? (
                    <img src={bgPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload size={20} className="text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Carica immagine sfondo</span>
                    </>
                  )}
                </div>
              </div>

              {/* Owner email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground uppercase tracking-wider">Email Proprietario (per gestire accessi)</label>
                <input
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                  placeholder="mario.rossi@email.com"
                />
                <p className="text-[11px] text-muted-foreground italic">Inserisci la tua email per gestire chi può accedere al profilo</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-muted/50 text-foreground py-3 rounded-xl text-sm uppercase tracking-widest font-medium hover:bg-muted transition-all"
                >
                  Indietro
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-medium text-sm tracking-widest uppercase shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creazione...
                    </>
                  ) : (
                    "Crea Profilo"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
