import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, ''); // e.g. https://xxx.supabase.co

const jwks =
  SUPABASE_URL ?
    createRemoteJWKSet(
      new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
    )
    : null;

export interface AuthPayload {
  sub: string;
  email?: string;
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
  authPayload?: AuthPayload;
}

/** Require valid Supabase JWT. Sets req.userId and req.authPayload. */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : undefined;

  if (!token) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  try {
    let sub: string | undefined;

    if (jwks) {
      const { payload } = await jwtVerify(token, jwks);
      sub = payload.sub as string;
    } else if (JWT_SECRET) {
      const payload = jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS256'],
      }) as AuthPayload;
      sub = payload.sub;
    } else {
      console.error('Set SUPABASE_URL (for JWKS) or SUPABASE_JWT_SECRET (legacy)');
      res.status(500).json({ error: 'Server auth misconfiguration' });
      return;
    }

    if (!sub) {
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }

    req.userId = sub;
    req.authPayload = { sub };
    next();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid or expired token';
    console.error('[auth] JWT verify failed:', message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
