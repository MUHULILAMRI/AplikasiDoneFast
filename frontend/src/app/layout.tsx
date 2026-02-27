import type { Metadata } from "next";
import { Inter, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/AuthProvider";
import FloatingActions from "@/components/FloatingActions";

const interSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfitSans = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DoneFast - Platform Jasa Digital #1 Indonesia",
  description: "Marketplace jasa akademik & teknologi terpercaya. Makalah, skripsi, coding, desain, dan konsultasi profesional dengan harga terjangkau.",
  keywords: "jasa akademik, jasa coding, jasa desain, jasa skripsi, jasa makalah, freelancer Indonesia",
  openGraph: {
    title: "DoneFast - Platform Jasa Digital #1 Indonesia",
    description: "Tugas selesai lebih cepat dari yang kamu bayangkan. Order sekarang!",
    type: "website",
    locale: "id_ID",
    siteName: "DoneFast",
  },
  twitter: {
    card: "summary_large_image",
    title: "DoneFast - Platform Jasa Digital #1 Indonesia",
    description: "Tugas selesai lebih cepat dari yang kamu bayangkan.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body
        className={`${interSans.variable} ${geistMono.variable} ${outfitSans.variable} antialiased bg-background text-foreground bg-noise`}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a2e',
              color: '#f0f0f5',
              border: '1px solid #2a2a3e',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <AuthProvider>
          {children}
          <FloatingActions />
        </AuthProvider>
      </body>
    </html>
  );
}

