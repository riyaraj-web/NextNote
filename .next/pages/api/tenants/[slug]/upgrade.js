import prisma from '../../../../lib/prisma';
import { setCors, getUserFromToken } from '../../../../lib/auth';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const auth = await getUserFromToken(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const { user } = auth;
  const slug = req.query.slug;

  if (user.role !== 'ADMIN' || user.tenant.slug !== slug) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const updated = await prisma.tenant.update({
    where: { slug },
    data: { plan: 'PRO' },
  });

  return res.json({ success: true, tenant: { slug: updated.slug, plan: updated.plan } });
}
