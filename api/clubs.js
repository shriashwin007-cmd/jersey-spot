import { listClubLogos } from './_cloudinary.js';

// Public — the list of club logos currently in Cloudinary. Both the public
// catalogue's club filter and the admin upload form's club dropdown read
// from this single endpoint.
export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }
  try {
    const clubs = await listClubLogos();
    return res.status(200).json({ clubs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
