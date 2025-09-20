import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyPassword, signJWT } from '../utils/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email (across all tenants)
    const user = await prisma.user.findFirst({
      where: { email },
      include: { tenant: true },
    });

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug: user.tenant.slug,
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          slug: user.tenant.slug,
          plan: user.tenant.plan,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;