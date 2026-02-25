// ============================================
// DoneFast - Simple Rate Limiter Utility
// ============================================
import { LRUCache } from 'lru-cache';

interface RateLimitConfig {
    interval: number; // millisecond
    uniqueTokenPerInterval: number; // max request per interval
}

const tokenCache = new LRUCache<string, number[]>({
    max: 500,
    ttl: 60 * 1000,
});

export const rateLimit = (options?: RateLimitConfig) => {
    const limit = options?.uniqueTokenPerInterval || 10;

    return {
        check: async (token: string) => {
            const tokenCount = tokenCache.get(token) || [0];
            if (tokenCount[0] === 0) {
                tokenCache.set(token, [1]);
            } else {
                tokenCount[0] += 1;
                tokenCache.set(token, tokenCount);
            }

            const currentUsage = tokenCount[0];
            const isRateLimited = currentUsage >= limit;

            return {
                isRateLimited,
                usage: currentUsage,
                limit,
                remaining: isRateLimited ? 0 : limit - currentUsage,
            };
        },
    };
};
