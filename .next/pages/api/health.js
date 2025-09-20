import { setCors } from '../../lib/auth';
export default function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.json({ status: 'ok' });
}
