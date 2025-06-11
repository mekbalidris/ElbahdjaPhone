import { NextResponse } from 'next/server';

// Store rate limit data in memory (consider using Redis for production)
const rateLimit = new Map();

// Rate limit configuration
const RATE_LIMIT = {
    auth: {
        maxRequests: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
    },
    orders: {
        maxRequests: 10,
        windowMs: 60 * 60 * 1000, // 1 hour
    },
    api: {
        maxRequests: 100,
        windowMs: 60 * 60 * 1000, // 1 hour
    }
};

export function rateLimiter(handler) {
    return async (req, res) => {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const path = req.nextUrl.pathname;
        
        // Determine which rate limit to apply
        let limitConfig;
        if (path.startsWith('/api/auth')) {
            limitConfig = RATE_LIMIT.auth;
        } else if (path.startsWith('/api/orders')) {
            limitConfig = RATE_LIMIT.orders;
        } else {
            limitConfig = RATE_LIMIT.api;
        }

        const now = Date.now();
        const windowStart = now - limitConfig.windowMs;

        // Get or initialize rate limit data for this IP
        if (!rateLimit.has(ip)) {
            rateLimit.set(ip, []);
        }

        const requests = rateLimit.get(ip);
        
        // Remove old requests outside the window
        while (requests.length && requests[0] < windowStart) {
            requests.shift();
        }

        // Check if rate limit is exceeded
        if (requests.length >= limitConfig.maxRequests) {
            return new NextResponse(
                JSON.stringify({
                    error: 'Too many requests, please try again later.'
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': Math.ceil((requests[0] + limitConfig.windowMs - now) / 1000)
                    }
                }
            );
        }

        // Add current request timestamp
        requests.push(now);
        rateLimit.set(ip, requests);

        // Add rate limit headers
        const response = await handler(req, res);
        response.headers.set('X-RateLimit-Limit', limitConfig.maxRequests);
        response.headers.set('X-RateLimit-Remaining', Math.max(0, limitConfig.maxRequests - requests.length));
        response.headers.set('X-RateLimit-Reset', Math.ceil((requests[0] + limitConfig.windowMs) / 1000));

        return response;
    };
} 