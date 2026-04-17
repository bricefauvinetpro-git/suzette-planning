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
      <body className="min-h-full flex flex-col bg-zinc-50">
        <header className="bg-white border-b border-zinc-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-3">
            <span className="text-lg font-bold text-zinc-900 tracking-tight">
              Suzette
            </span>
            <span className="text-zinc-300">|</span>
            <nav className="flex items-center gap-4 text-sm">
              <a
                href="/planning"
                className="text-zinc-600 hover:text-zinc-900 font-medium transition-colors"
              >
                Planning
              </a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
