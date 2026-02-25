'use client';

import { motion } from 'framer-motion';

export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-surface-2 rounded-lg ${className}`} />
    );
}

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass rounded-2xl p-5 space-y-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="space-y-1">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-24" />
            </div>
            <div className="glass rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-border">
                    <Skeleton className="h-4 w-full" />
                </div>
                <div className="divide-y divide-border">
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="p-4 flex gap-4 items-center">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
