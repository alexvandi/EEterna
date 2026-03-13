"use client";

import { useState } from "react";
import { setVisitorName } from "@/lib/db";

interface VisitorIdentificationProps {
  onIdentified: (name: string) => void;
  onCancel: () => void;
}

export default function VisitorIdentification({ onIdentified, onCancel }: VisitorIdentificationProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setVisitorName(name.trim());
      onIdentified(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative overflow-hidden animate-scale-in">
        {/* Top accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

        <h3 className="text-xl font-serif text-foreground mb-2 mt-2">Chiudi gli occhi e ricorda...</h3>
        <p className="text-sm text-muted-foreground mb-6 font-serif italic">
          Per condividere un pensiero o una foto, ci farebbe piacere sapere chi sei.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground uppercase tracking-wider">Il tuo Nome</label>
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground transition-all"
              placeholder="Es. Marco, oppure 'I tuoi nipoti'"
            />
          </div>

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-muted/50 text-foreground py-2.5 rounded-xl text-sm tracking-widest hover:bg-muted transition-all uppercase font-medium"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm tracking-widest hover:bg-primary/90 transition-all uppercase font-medium disabled:opacity-50"
            >
              Continua
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
