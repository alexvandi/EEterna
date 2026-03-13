import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary/5 to-transparent -z-10" />

      {/* Header Section */}
      <div className="flex flex-col items-center mb-16 animate-fade-in text-center max-w-2xl px-4">
        {/* Heart Icon / Logo Placeholder */}
        <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center mb-8 shadow-sm bg-white">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary stroke-[1.5]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl text-foreground tracking-wide font-medium mb-6 font-serif">
          Eterna Solution
        </h1>
        <div className="w-12 h-px bg-primary/40 mb-6"></div>
        <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide max-w-lg leading-relaxed font-serif italic">
          Preserviamo i ricordi. Onoriamo la vita.<br />Un luogo dove l'amore continua a vivere.
        </p>
      </div>

      {/* Action Area (For simulation during dev) */}
      <div className="w-full max-w-xs flex flex-col gap-4 animate-slide-up mt-8">
        <Link
          href="/qr/test-id-123"
          className="w-full bg-primary text-primary-foreground py-4 rounded-md font-medium text-sm tracking-widest hover:bg-primary/90 transition-all duration-500 uppercase block text-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Simula Scansione QR
        </Link>
      </div>

      {/* Footer Status */}
      <div className="absolute bottom-6 text-muted-foreground/60 text-[10px] tracking-widest uppercase">
        © {new Date().getFullYear()} Eterna Solution
      </div>
    </div>
  );
}
