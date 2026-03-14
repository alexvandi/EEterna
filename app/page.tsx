"use client";

import { Leaf, Shield, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllQrCodes, QrCode } from "@/lib/db";

export default function Home() {
  const [testQrs, setTestQrs] = useState<QrCode[]>([]);

  useEffect(() => {
    const loadQrs = async () => {
      const qrs = await getAllQrCodes();
      setTestQrs(qrs);
    };
    loadQrs();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden animate-fade-in relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-gradient-to-br from-[#ECEBE8] via-white to-[#E5E5E0]">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[hsl(210,20%,94%)] blur-3xl opacity-60 mix-blend-multiply" />
        <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#D4D9D2] blur-3xl opacity-40 mix-blend-multiply" />
      </div>

      <main className="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center">
        {/* Header content */}
        <div className="text-center space-y-6 max-w-2xl mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-border/40 backdrop-blur-md shadow-sm mb-4">
            <Leaf size={14} className="text-[#8B9688]" />
            <span className="text-xs tracking-[0.2em] font-medium uppercase text-muted-foreground">Eterna Memorial</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif text-foreground leading-[1.15] tracking-tight">
            I ricordi più preziosi vivono in eterno.
          </h1>
          
          <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Conserva le storie, le foto e i pensieri di chi ami in un unico luogo digitale, accessibile in modo sicuro solo a chi desideri.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
          <div className="bg-white/60 backdrop-blur-md border border-border/40 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-4 border border-blue-100/50">
              <Share2 size={18} className="text-blue-600" />
            </div>
            <h3 className="font-serif text-lg font-medium mb-2">QR Code Unico</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Un codice collegato per sempre al profilo. Scansiona per accedere ai ricordi.
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-md border border-border/40 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-4 border border-amber-100/50">
              <Shield size={18} className="text-amber-600" />
            </div>
            <h3 className="font-serif text-lg font-medium mb-2">Accesso Privato</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Scegli tu chi può vedere le foto e i messaggi. Sistema di inviti sicuro.
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-md border border-border/40 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mb-4 border border-rose-100/50">
              <Heart size={18} className="text-rose-600" />
            </div>
            <h3 className="font-serif text-lg font-medium mb-2">Ricordi Condivisi</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Amici e parenti possono caricare foto e lasciare pensieri con approvazione.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}

