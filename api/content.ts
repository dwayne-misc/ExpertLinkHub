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
    
    const range = 'Content!A:F';
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

    const sections = rows.slice(1).map((row: string[]) => ({
      title: row[0] || '',
      content: row[1] || '',
      order: parseInt(row[2] || '0', 10),
      type: row[3] || 'text',
      imageUrl: row[4] || '',
      secondaryContent: row[5] || ''
    })).sort((a, b) => a.order - b.order);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(sections);

  } catch (error: any) {
    console.error('Error fetching content:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch content sections',
      error: error.message
    });
  }
}
