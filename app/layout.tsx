import type { Metadata } from "next";
import { Playfair_Display, Lora, Inter } from "next/font/google"; 
import "./globals.css";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Eterna Solution",
  description: "Preserviamo i ricordi di chi amiamo. Un luogo dove l'amore continua a vivere.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={cn(inter.variable, playfair.variable, lora.variable, "antialiased bg-background text-foreground min-h-screen flex flex-col font-sans selection:bg-primary/20")}>
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
