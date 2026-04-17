import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Suzette Planning",
  description: "Gestion du planning de l'équipe Suzette",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "#f4f5f7" }}>
        <header style={{ backgroundColor: "#1a1a2e" }}>
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
            <span className="text-white font-bold text-lg tracking-tight">
              Suzette
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <nav className="flex items-center gap-5">
              <a
                href="/planning"
                className="text-sm font-medium transition-colors"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Planning
              </a>
              <a
                href="/team"
                className="text-sm font-medium transition-colors"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Équipe
              </a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
