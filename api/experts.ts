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
    
    const range = 'Experts!A:K';
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

    interface ExpertRow {
      firstName: string;
      lastName: string;
      credentials: string;
      email: string;
      city: string;
      state: string;
      category: string;
      group: string;
      specialty: string;
      isPublished: string;
      url: string;
    }

    const experts = rows.slice(1).map((row: string[]): ExpertRow => ({
      firstName: row[0] || '',
      lastName: row[1] || '',
      credentials: row[2] || '',
      email: row[3] || '',
      city: row[4] || '',
      state: row[5] || '',
      category: row[6] || '',
      group: row[7] || '',
      specialty: row[8] || '',
      isPublished: row[9] || '',
      url: row[10] || ''
    })).filter((expert: ExpertRow) => expert.isPublished.toLowerCase() === 'yes');

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(experts);

  } catch (error: any) {
    console.error('Error fetching experts:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch experts',
      error: error.message
    });
  }
}
