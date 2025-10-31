import type { VercelRequest, VercelResponse } from '@vercel/node';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1kRomUELKC_iLfW5OQFG-78mc8r8jQ1qujDhINhdygEg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const results: any = {
    steps: [],
    error: null
  };

  try {
    results.steps.push('1. Starting...');

    // Get credentials
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
    results.steps.push('2. Parsed credentials');

    // Create JWT
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
    results.steps.push('3. Created JWT');

    // Exchange for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    results.steps.push('4. Got access token');

    // Try to fetch from Google Sheets
    const range = 'Experts!A1:J1';
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;
    
    results.steps.push(`5. Fetching from: ${sheetsUrl}`);

    const sheetsResponse = await fetch(sheetsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    results.sheetsStatus = sheetsResponse.status;
    results.steps.push(`6. Sheets API response: ${sheetsResponse.status}`);

    if (!sheetsResponse.ok) {
      const errorText = await sheetsResponse.text();
      results.sheetsError = errorText;
      throw new Error(`Sheets API failed: ${sheetsResponse.status} ${errorText}`);
    }

    const sheetsData = await sheetsResponse.json();
    results.steps.push('7. Parsed sheets data');
    results.headerRow = sheetsData.values?.[0] || [];
    results.success = true;

    return res.status(200).json(results);

  } catch (error: any) {
    results.error = error.message;
    results.errorStack = error.stack;
    return res.status(500).json(results);
  }
}
