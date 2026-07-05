import { checkAdminPassword } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  // password arrives in the header for this check too, keeping one code path
  const ok = checkAdminPassword(req);
  return res.status(200).json({ ok });
}
