'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { fetchUser, isAuthenticated } = useAppStore();

    useEffect(() => {
        // Cek token di localStorage, jika ada maka fetch user
        const token =
            typeof window !== 'undefined'
                ? localStorage.getItem('donefast_token')
                : null;

        if (token && !isAuthenticated) {
            fetchUser();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <>{children}</>;
}
