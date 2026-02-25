'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-12 glass rounded-3xl border-dashed border-2 border-border"
        >
            <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-muted/50" />
            </div>
            <h3 className="text-lg font-semibold text-center">{title}</h3>
            <p className="text-sm text-muted text-center mt-1 max-w-xs">
                {description}
            </p>
            {actionLabel && (
                <button
                    onClick={onAction}
                    className="mt-6 px-6 py-2 bg-primary/10 text-primary-light hover:bg-primary/20 rounded-xl text-sm font-medium transition-colors"
                >
                    {actionLabel}
                </button>
            )}
        </motion.div>
    );
}
