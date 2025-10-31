import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const results: any = {
    step1_envCheck: false,
    step2_parseJSON: false,
    step3_createJWT: false,
    step4_exchangeToken: false,
    error: null
  };

  try {
    // Step 1: Check env
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not set');
    }
    results.step1_envCheck = true;

    // Step 2: Parse JSON
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    results.step2_parseJSON = true;
    results.email = credentials.client_email;

    // Step 3: Create JWT
    const jwtHeader = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const jwtClaimSet = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    const base64url = (obj: any) => {
      return Buffer.from(JSON.stringify(obj))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };

    const headerAndPayload = `${base64url(jwtHeader)}.${base64url(jwtClaimSet)}`;
    
    // Try to import crypto
    const crypto = await import('crypto');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(headerAndPayload);
    const signature = sign.sign(credentials.private_key, 'base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const jwt = `${headerAndPayload}.${signature}`;
    results.step3_createJWT = true;
    results.jwtLength = jwt.length;

    // Step 4: Exchange for access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    results.step4_exchangeToken = response.ok;
    results.tokenResponseStatus = response.status;

    if (response.ok) {
      const data = await response.json();
      results.hasAccessToken = !!data.access_token;
    } else {
      const errorText = await response.text();
      results.tokenError = errorText;
    }

    return res.status(200).json(results);

  } catch (error: any) {
    results.error = error.message;
    results.errorStack = error.stack;
    return res.status(500).json(results);
  }
}
