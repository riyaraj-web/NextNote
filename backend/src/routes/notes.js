import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/notes - List all notes for the current tenant
router.get('/', requireAuth, async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { tenantId: req.user.tenantId },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST /api/notes - Create a new note
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Check note limit for free plan
    if (req.user.tenant.plan === 'free') {
      const noteCount = await prisma.note.count({
        where: { tenantId: req.user.tenantId },
      });

      if (noteCount >= 3) {
        return res.status(403).json({ 
          error: 'Note limit reached. Upgrade to Pro for unlimited notes.',
          code: 'NOTE_LIMIT_REACHED'
        });
      }
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: req.user.id,
        tenantId: req.user.tenantId,
      },
      include: { user: { select: { email: true } } },
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// GET /api/notes/:id - Get specific note
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const note = await prisma.note.findFirst({
      where: { 
        id: req.params.id,
        tenantId: req.user.tenantId, // Ensure tenant isolation
      },
      include: { user: { select: { email: true } } },
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.status(200).json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// PUT /api/notes/:id - Update note
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Verify note belongs to the user's tenant
    const existingNote = await prisma.note.findFirst({
      where: { 
        id: req.params.id,
        tenantId: req.user.tenantId,
      },
    });

    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const updatedNote = await prisma.note.update({
      where: { id: req.params.id },
      data: { title, content },
      include: { user: { select: { email: true } } },
    });

    res.status(200).json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE /api/notes/:id - Delete note
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    // Verify note belongs to the user's tenant
    const existingNote = await prisma.note.findFirst({
      where: { 
        id: req.params.id,
        tenantId: req.user.tenantId,
      },
    });

    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await prisma.note.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;