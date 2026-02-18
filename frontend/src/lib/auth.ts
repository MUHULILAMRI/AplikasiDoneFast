// ============================================
// DoneFast - Auth Helper Utilities
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'donefast-secret-key-change-in-production-2026'
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'JOKI';
  iat?: number;
  exp?: number;
}

// Generate JWT token
export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// Extract token from request
export function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return req.cookies.get('token')?.value || null;
}

// Auth middleware helper — returns decoded user or error response
export async function authenticateRequest(
  req: NextRequest
): Promise<{ user: JWTPayload } | { error: NextResponse }> {
  const token = extractToken(req);
  if (!token) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Token tidak ditemukan. Silakan login.' },
        { status: 401 }
      ),
    };
  }

  const user = await verifyToken(token);
  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Token tidak valid atau sudah expired.' },
        { status: 401 }
      ),
    };
  }

  return { user };
}

// Role-based guard
export async function requireRole(
  req: NextRequest,
  ...roles: JWTPayload['role'][]
): Promise<{ user: JWTPayload } | { error: NextResponse }> {
  const result = await authenticateRequest(req);
  if ('error' in result) return result;

  if (!roles.includes(result.user.role)) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Tidak memiliki akses.' },
        { status: 403 }
      ),
    };
  }

  return result;
}

// Simple password hash using Web Crypto (no bcrypt dependency needed)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const hashHex = Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':');
  if (!saltHex || !hashHex) return false;

  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const computedHash = Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, '0')).join('');
  return computedHash === hashHex;
}

// Standard API response helpers
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function apiPaginated<T>(data: T[], total: number, page: number, limit: number) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
