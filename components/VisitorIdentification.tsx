"use client";

import { useState } from "react";
import { User, X, Mail } from "lucide-react";

interface VisitorIdentificationProps {
  onIdentified: (name: string, email: string) => void;
  onCancel: () => void;
}

export default function VisitorIdentification({ onIdentified, onCancel }: VisitorIdentificationProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onIdentified(name.trim(), email.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full animate-scale-in relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>

        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
          <User size={24} />
        </div>
        
        <h3 className="text-xl font-serif font-medium text-foreground mb-2">Identificazione Richiesta</h3>
        <p className="text-sm text-muted-foreground mb-6 font-serif italic">
          Per interagire con il memoriale, ti chiediamo di inserire i tuoi dati. Questo aiuta la famiglia a sapere chi ha lasciato un ricordo.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User size={12} /> Il tuo Nome
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Marco Rossi"
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Mail size={12} /> La tua Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="marco@email.com"
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-muted/50 rounded-xl text-sm font-medium tracking-widest uppercase text-foreground hover:bg-muted transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !email.trim()}
              className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-medium tracking-widest uppercase shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              Conferma
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
