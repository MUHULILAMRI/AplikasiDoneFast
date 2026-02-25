'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const labelMap: Record<string, string> = {
    dashboard: 'Dashboard',
    admin: 'Admin',
    joki: 'Joki',
    orders: 'Daftar Order',
    customers: 'Pelanggan',
    finance: 'Keuangan',
    reports: 'Laporan',
    team: 'Tim Joki',
    promo: 'Promo',
    settings: 'Pengaturan',
    chat: 'Chat',
    upload: 'Upload Hasil',
    commission: 'Komisi',
    reviews: 'Rating & Review',
};

export default function Breadcrumbs() {
    const pathname = usePathname();
    const paths = pathname.split('/').filter(Boolean);

    if (paths.length === 0) return null;

    return (
        <nav className="flex items-center gap-2 text-xs text-muted mb-2 overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home className="w-3 h-3" />
                Home
            </Link>

            {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join('/')}`;
                const isLast = index === paths.length - 1;
                const label = labelMap[path] || path.charAt(0).toUpperCase() + path.slice(1);

                return (
                    <div key={href} className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                        {isLast ? (
                            <span className="font-medium text-foreground">{label}</span>
                        ) : (
                            <Link href={href} className="hover:text-primary transition-colors">
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
