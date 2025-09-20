import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Updated interface with proper types including email
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;        // Changed from string to number
    tenantId: number;  // Changed from string to number
    role: string;
    email: string;     // Added missing email property
  };
}

export const createNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content } = req.body;
    const { id: userId, tenantId } = req.user!;

    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Check subscription limits for free plan
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    // Fixed: Handle undefined plan properly and compare enum correctly
    if (tenant?.plan && tenant.plan.toString() === 'free') {
      const noteCount = await prisma.note.count({
        where: { tenantId: tenantId }
      });

      if (noteCount >= 3) {
        return res.status(403).json({
          error: 'Note limit exceeded. Upgrade to Pro for unlimited notes.',
          limitReached: true
        });
      }
    }

    // Create the note - Use the correct field names from your schema
    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        content: content || '',
        // Try authorId instead of userId (common alternative)
        authorId: userId,
        tenantId: tenantId
      },
      include: {
        author: {  // Use author instead of user
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};