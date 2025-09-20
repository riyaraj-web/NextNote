import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/tenants/:slug/upgrade - Upgrade tenant to Pro plan
router.post('/:slug/upgrade', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { slug } = req.params;

    // Verify the tenant slug matches the user's tenant
    if (req.user.tenant.slug !== slug) {
      return res.status(403).json({ error: 'Cannot upgrade a different tenant' });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: req.user.tenantId },
      data: { plan: 'pro' },
    });

    res.status(200).json({
      message: 'Tenant upgraded successfully',
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error('Error upgrading tenant:', error);
    res.status(500).json({ error: 'Failed to upgrade tenant' });
  }
});

export default router;