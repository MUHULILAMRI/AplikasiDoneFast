'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Twitter, Youtube } from 'lucide-react';

const footerLinks = {
  layanan: [
    { label: 'Akademik', href: '/marketplace?cat=akademik' },
    { label: 'Coding & Web', href: '/marketplace?cat=coding' },
    { label: 'Desain & Arsitektur', href: '/marketplace?cat=arsitektur' },
    { label: 'Konsultasi', href: '/marketplace?cat=konsultasi' },
    { label: 'AI & Teknologi', href: '/marketplace?cat=ai_teknologi' },
  ],
  perusahaan: [
    { label: 'Tentang Kami', href: '/about' },
    { label: 'Cara Kerja', href: '/#cara-kerja' },
    { label: 'Karir', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Partner', href: '/partner' },
  ],
  bantuan: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Kebijakan Privasi', href: '/privacy' },
    { label: 'Syarat & Ketentuan', href: '/terms' },
    { label: 'Hubungi Kami', href: '/contact' },
    { label: 'Refund Policy', href: '/refund' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-lg">
                DF
              </div>
              <span className="text-xl font-bold gradient-text">
                DoneFast
              </span>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              Platform jasa digital #1 Indonesia. Solusi cepat & terpercaya untuk kebutuhan akademik dan teknologi Anda.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-surface-2 hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4 text-muted" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-surface-2 hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4 text-muted" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-surface-2 hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4 text-muted" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-foreground mb-4 capitalize">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted">
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> support@donefast.id
            </span>
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> +62 812-3456-7890
            </span>
          </div>
          <p className="text-sm text-muted">
            © 2026 DoneFast. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
