import { getUserFromToken } from '../utils/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function requireAuth(req, res, next) {
  try {
    const user = getUserFromToken(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user still exists and get fresh data
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { tenant: true },
    });

    if (!dbUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      tenantId: dbUser.tenantId,
      tenant: dbUser.tenant,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

export function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== requiredRole && requiredRole !== 'any') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}