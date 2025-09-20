import prisma from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { setCors } from '../../../lib/auth';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email+password required' });

  const user = await prisma.user.findFirst({
    where: { email },
    include: { tenant: true },
  });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { userId: user.id, role: user.role, tenantId: user.tenantId, tenantSlug: user.tenant.slug },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: { email: user.email, role: user.role, tenantSlug: user.tenant.slug },
  });
}
