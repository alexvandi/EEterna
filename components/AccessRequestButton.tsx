"use client";

import { useState } from "react";
import { createAccessRequest, checkExistingRequest } from "@/lib/db";
import { Lock, Mail, User, Send, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

interface AccessRequestButtonProps {
  profileId: string;
}

export default function AccessRequestButton({ profileId }: AccessRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'initial' | 'form' | 'success' | 'already_requested'>('initial');
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = async () => {
    setIsOpen(true);
    setStep('form');
    
    // Check if we have an email in localstorage and if they already requested
    const savedEmail = localStorage.getItem('eterna_visitor_email');
    if (savedEmail) {
      setIsLoading(true);
      const existing = await checkExistingRequest(profileId, savedEmail);
      if (existing && existing.status === 'pending') {
        setStep('already_requested');
      }
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsLoading(true);
    
    const request = await createAccessRequest({
      profile_id: profileId,
      requester_name: formData.name,
      requester_email: formData.email,
      message: formData.message || undefined
    });

    if (request) {
      localStorage.setItem('eterna_visitor_email', formData.email);
      setStep('success');
    }
    
    setIsLoading(false);
  };

  return (
    <>
      <div className="px-4 py-8 flex flex-col items-center text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center mb-4">
          <Lock size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-serif text-foreground mb-2">Profilo Privato</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          I ricordi completi e i messaggi sono riservati a familiari e amici autorizzati.
        </p>
        <button
          onClick={handleOpen}
          className="bg-primary text-primary-foreground px-6 py-3.5 rounded-xl text-sm uppercase tracking-widest font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          Richiedi Accesso <ArrowRight size={16} />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-scale-in relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>

            {step === 'already_requested' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                  <Loader2 size={24} />
                </div>
                <h3 className="font-serif text-lg">Richiesta in Attesa</h3>
                <p className="text-sm text-muted-foreground">
                  Hai già inviato una richiesta di accesso da questo dispositivo. Attendi che il gestore del profilo la approvi.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-muted mt-4 text-foreground py-2.5 rounded-xl text-sm font-medium uppercase tracking-widest"
                >
                  Chiudi
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="font-serif text-lg">Richiesta Inviata</h3>
                <p className="text-sm text-muted-foreground">
                  Il gestore del profilo è stato notificato. Riceverai accesso non appena la tua richiesta verrà approvata.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-primary text-primary-foreground mt-4 py-2.5 rounded-xl text-sm font-medium uppercase tracking-widest hover:bg-primary/90"
                >
                  Chiudi
                </button>
              </div>
            )}

            {step === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="text-center mb-6">
                  <h3 className="font-serif text-lg mb-1">Richiedi Accesso</h3>
                  <p className="text-xs text-muted-foreground">Compila i dati per inviare la richiesta al gestore</p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
                      <User size={12} /> Il tuo Nome *
                    </label>
                    <input
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Mario Rossi"
                      className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
                      <Mail size={12} /> La tua Email *
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="mario@email.com"
                      className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider">Messaggio per il gestore (opzionale)</label>
                    <textarea
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Ciao, sono lo zio Mario..."
                      rows={2}
                      className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-serif italic"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !formData.name || !formData.email}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm uppercase tracking-widest font-medium disabled:opacity-50 mt-4 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Invia Richiesta</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
