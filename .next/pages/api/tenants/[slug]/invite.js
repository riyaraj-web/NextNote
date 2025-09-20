import prisma from '../../../../lib/prisma';
import bcrypt from 'bcrypt';
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

  const { email, role = 'MEMBER' } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });

  const passwordHash = await bcrypt.hash('password', 10); // default invite password = "password"
  const newUser = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      role,
      tenantId: user.tenantId,
    },
  });

  return res.json({ success: true, user: { email: newUser.email, role: newUser.role } });
}
