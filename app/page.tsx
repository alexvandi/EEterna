import Link from "next/link";
import { Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-primary/5 via-primary/3 to-transparent -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl -z-10" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-sage/5 rounded-full blur-3xl -z-10" />

      {/* Header Section */}
      <div className="flex flex-col items-center mb-16 animate-fade-in text-center max-w-2xl px-4">
        {/* Logo */}
        <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center mb-10 shadow-sm bg-white/80 backdrop-blur-sm">
          <Heart size={32} className="text-primary" strokeWidth={1.5} />
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl text-foreground tracking-wide font-medium mb-6 font-serif">
          Eterna Solution
        </h1>
        <div className="w-16 h-px bg-primary/30 mb-6" />
        <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide max-w-lg leading-relaxed font-serif italic">
          Preserviamo i ricordi. Onoriamo la vita.
          <br />
          Un luogo dove l&apos;amore continua a vivere.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full mb-12 animate-slide-up px-4">
        {[
          { icon: "📸", title: "Foto e Video", desc: "Carica ricordi preziosi" },
          { icon: "💬", title: "Messaggi", desc: "Lascia un pensiero" },
          { icon: "🔒", title: "Privacy", desc: "Controllo accessi completo" },
        ].map((item) => (
          <div key={item.title} className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="text-2xl mb-2">{item.icon}</div>
            <h3 className="text-sm font-medium text-foreground tracking-wider uppercase mb-1">{item.title}</h3>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="w-full max-w-xs flex flex-col gap-4 animate-slide-up">
        <Link
          href="/qr/demo-profile"
          className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-medium text-sm tracking-widest hover:bg-primary/90 transition-all duration-500 uppercase block text-center shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Visualizza Demo
        </Link>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-muted-foreground/50 text-[10px] tracking-widest uppercase">
        © {new Date().getFullYear()} Eterna Solution
      </div>
    </div>
  );
}
