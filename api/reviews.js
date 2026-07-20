const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SR  = process.env.SUPABASE_SR;

const headers = {
  'Content-Type':  'application/json',
  'apikey':        SUPABASE_SR,
  'Authorization': `Bearer ${SUPABASE_SR}`,
};

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/reviews?select=name,stars,comment,created_at&order=created_at.desc&limit=50`,
      { headers }
    );
    if (!r.ok) return res.status(500).json({ error: 'fetch failed' });
    return res.status(200).json(await r.json());
  }

  if (req.method === 'POST') {
    const { name, stars, comment } = req.body ?? {};

    if (
      typeof name    !== 'string' || name.trim().length    < 2  || name.trim().length    > 60  ||
      typeof comment !== 'string' || comment.trim().length < 10 || comment.trim().length > 500 ||
      typeof stars   !== 'number' || !Number.isInteger(stars)   || stars < 1 || stars > 5
    ) {
      return res.status(400).json({ error: 'invalid input' });
    }

    const r = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
      method:  'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body:    JSON.stringify({
        name:    name.trim(),
        stars,
        comment: comment.trim(),
      }),
    });

    if (!r.ok) return res.status(500).json({ error: 'insert failed' });
    return res.status(201).json({ ok: true });
  }

  return res.status(405).json({ error: 'method not allowed' });
}
