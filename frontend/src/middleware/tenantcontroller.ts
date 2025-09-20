import { Request, Response } from 'express';
import { PrismaClient, Plan } from '@prisma/client';

const prisma = new PrismaClient();

// Updated interface to match the notes controller and fix type issues
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;        // Changed from string to number to match Prisma schema
    tenantId: number;  // Changed from string to number to match Prisma schema
    role: string;
    email: string;     // Added missing email property for consistency
  };
}

export const upgradeTenant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const { tenantId, role } = req.user!;

    // Check if user is an admin
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can upgrade subscriptions' });
    }

    // Verify tenant ownership
    const tenant = await prisma.tenant.findFirst({
      where: {
        slug,
        id: tenantId 
      }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Update the tenant's subscription plan to 'pro'
    // Fixed: Use Plan enum instead of string literal
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { plan: Plan.PRO }  // Changed from 'pro' to Plan.PRO enum
    });

    res.json({
      message: 'Tenant upgraded successfully',
      tenant: updatedTenant
    });
  } catch (error) {
    console.error('Upgrade tenant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};