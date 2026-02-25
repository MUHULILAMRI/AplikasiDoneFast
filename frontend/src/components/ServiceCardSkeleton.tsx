'use client';

export default function ServiceCardSkeleton() {
    return (
        <div className="glass rounded-2xl overflow-hidden animate-pulse">
            {/* Card Header gradient bar */}
            <div className="h-3 bg-surface-2" />

            <div className="p-6">
                {/* Badge row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="h-6 w-24 bg-surface-2 rounded-lg" />
                    <div className="h-6 w-16 bg-surface-2 rounded-lg" />
                </div>

                {/* Title */}
                <div className="h-6 w-3/4 bg-surface-2 rounded-lg mb-3" />
                {/* Description */}
                <div className="space-y-2 mb-4">
                    <div className="h-4 w-full bg-surface-2 rounded-lg" />
                    <div className="h-4 w-2/3 bg-surface-2 rounded-lg" />
                </div>

                {/* Features */}
                <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-surface-2 rounded-md" />
                    <div className="h-6 w-20 bg-surface-2 rounded-md" />
                    <div className="h-6 w-14 bg-surface-2 rounded-md" />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-4 w-12 bg-surface-2 rounded" />
                    <div className="h-4 w-16 bg-surface-2 rounded" />
                    <div className="h-4 w-20 bg-surface-2 rounded" />
                </div>

                {/* Price & CTA */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div>
                        <div className="h-3 w-16 bg-surface-2 rounded mb-1" />
                        <div className="h-7 w-24 bg-surface-2 rounded-lg" />
                    </div>
                    <div className="h-5 w-16 bg-surface-2 rounded" />
                </div>
            </div>
        </div>
    );
}
