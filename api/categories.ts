import type { VercelRequest, VercelResponse } from '@vercel/node';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1kRomUELKC_iLfW5OQFG-78mc8r8jQ1qujDhINhdygEg';

async function getAccessToken(): Promise<string> {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  
  const jwtHeader = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const jwtClaimSet = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64url = (obj: any) => 
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

  const headerAndPayload = `${base64url(jwtHeader)}.${base64url(jwtClaimSet)}`;
  
  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(headerAndPayload);
  const signature = sign.sign(credentials.private_key, 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const jwt = `${headerAndPayload}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const accessToken = await getAccessToken();
    
    const range = 'Expert Categories!A:C';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sheets API failed: ${response.status} ${error}`);
    }

    const data = await response.json();
    const rows = data.values || [];

    if (rows.length === 0) {
      return res.status(200).json([]);
    }

    const categoryMap = new Map<string, { specialties: Set<string>, topLine: string }>();

    rows.slice(1).forEach((row: string[]) => {
      const category = row[0]?.trim();
      const specialty = row[1]?.trim();
      const topLine = row[2]?.trim() || '';

      if (category) {
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { specialties: new Set(), topLine });
        }
        if (specialty) {
          categoryMap.get(category)!.specialties.add(specialty);
        }
      }
    });

    const categories = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      specialties: Array.from(data.specialties).sort(),
      topLine: data.topLine
    }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(categories);

  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
}
