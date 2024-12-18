import { cache } from '@config/cache';
import { logWarning } from '@utils/logger';
import { type NextFunction, type Request, type Response } from 'express';

interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
}

const createRateLimiter =
  (key: string, options: RateLimitOptions) => async (value: string) => {
    const identifier = `${key}:${value}`;
    const hits = await cache().rateLimiter.get(identifier);

    if (hits) {
      if (hits > options.maxRequests) {
        logWarning({ message: 'Too many requests', details: { identifier } });
        throw new Error('Too many requests');
      }
      await cache().rateLimiter.increment(`${key}:${value}`);
    } else {
      await cache().rateLimiter.set({
        key: `${key}:${value}`,
        value: 1,
        ttl: options.windowSeconds
      });
    }
  };

export type RateLimiter = ReturnType<typeof createRateLimiter>;

// Example: Different rate limiters for different routes

export const contactFormRateLimiter = createRateLimiter('contactForm', {
  windowSeconds: 60,
  maxRequests: 10
});

export const loginRateLimiter = createRateLimiter('login', {
  windowSeconds: 60,
  maxRequests: 20
});
export const registerRateLimiter = createRateLimiter('register', {
  windowSeconds: 60,
  maxRequests: 10
});
export const passwordResetRateLimiter = createRateLimiter('passwordReset', {
  windowSeconds: 60,
  maxRequests: 5
});
export const forgotPasswordRateLimiter = createRateLimiter('forgotPassword', {
  windowSeconds: 60,
  maxRequests: 10
});
export const validateTokenRateLimiter = createRateLimiter('validateToken', {
  windowSeconds: 60,
  maxRequests: 200
});
export const verifyLoginRateLimiter = createRateLimiter('verifyLogin', {
  windowSeconds: 60,
  maxRequests: 20
});

export const getUserDetails = (req: Request) => {
  const userAgent = req.get('User-Agent') || '';
  let ipAddress = '';

  if (req.headers['x-forwarded-for']) {
    // 'x-forwarded-for' may return multiple IP addresses in the format: "client IP, proxy 1 IP, proxy 2 IP"
    const forwardedIps = (req.headers['x-forwarded-for'] as string).split(',');
    ipAddress = forwardedIps[0].trim();
  } else if (req.ip) {
    ipAddress = req.ip;
  } else if (req.socket?.remoteAddress) {
    ipAddress = req.socket.remoteAddress;
  }

  return { userAgent, ipAddress };
};

export const rateLimiterMiddleware =
  (rateLimiter: RateLimiter, getKey?: (req: Request) => string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const ip = getKey ? getKey(req) : getUserDetails(req).ipAddress;

    try {
      await rateLimiter(ip);
      return next();
    } catch (error) {
      res.status(429).json({ message: 'Too many requests' });
      return res.end();
    }
  };
