import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1kRomUELKC_iLfW5OQFG-78mc8r8jQ1qujDhINhdygEg';

const expertSubmissionSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  url: z.string().optional().or(z.literal("")),
  credentials: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  category: z.string().min(1, "Category is required"),
  specialties: z.array(z.string()).min(1, "Select 1-3 specialties").max(3, "Maximum 3 specialties allowed"),
});

function normalizeUrl(url: string | undefined): string {
  if (!url || url.trim() === '') {
    return '';
  }
  
  const trimmedUrl = url.trim();
  
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  
  return `https://${trimmedUrl}`;
}

async function getAccessToken(): Promise<string> {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  
  const jwtHeader = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const jwtClaimSet = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const validationResult = expertSubmissionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors 
      });
    }

    const { firstName, lastName, email, url, credentials, city, state, category, specialties } = validationResult.data;
    const { topLine } = req.body;

    if (!topLine) {
      return res.status(400).json({ message: 'TopLine is required' });
    }

    const accessToken = await getAccessToken();
    
    const specialtyString = Array.isArray(specialties) ? specialties.join(', ') : specialties;
    const normalizedUrl = normalizeUrl(url);
    
    const newRow = [
      firstName,
      lastName,
      credentials || '',
      email,
      city || '',
      state || '',
      category,
      topLine,
      specialtyString,
      'No',
      normalizedUrl
    ];

    const range = 'Experts!A:K';
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW`;

    const response = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [newRow]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to append to sheet: ${response.status} ${error}`);
    }

    return res.status(200).json({ 
      message: 'Expert submission successful',
      success: true
    });

  } catch (error: any) {
    console.error('Error submitting expert:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      message: 'Failed to submit expert',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      success: false
    });
  }
}
