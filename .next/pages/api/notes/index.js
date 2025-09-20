import prisma from '../../../lib/prisma';
import { setCors, getUserFromToken } from '../../../lib/auth';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = await getUserFromToken(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const { user } = auth;

  if (req.method === 'GET') {
    const notes = await prisma.note.findMany({ where: { tenantId: user.tenantId } });
    return res.json(notes);
  }

  if (req.method === 'POST') {
    // Subscription gating: Free plan limited to 3 notes
    const tenant = user.tenant;
    if (tenant.plan === 'FREE') {
      const count = await prisma.note.count({ where: { tenantId: tenant.id } });
      if (count >= 3) {
        return res.status(403).json({ error: 'Tenant free plan limit reached', code: 'PLAN_LIMIT' });
      }
    }

    const { title, content } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title required' });

    const note = await prisma.note.create({
      data: { title, content, tenantId: user.tenantId, authorId: user.id },
    });

    return res.status(201).json(note);
  }

  return res.status(405).end();
}
