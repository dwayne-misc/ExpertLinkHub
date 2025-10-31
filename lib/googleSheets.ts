interface GoogleJWTCredentials {
  client_email: string;
  private_key: string;
  project_id: string;
}

async function getAccessToken(credentials: GoogleJWTCredentials): Promise<string> {
  const jwtHeader = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const jwtClaimSet = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  // Base64url encode
  const base64url = (obj: any) => {
    return Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const headerAndPayload = `${base64url(jwtHeader)}.${base64url(jwtClaimSet)}`;

  // Sign with private key
  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(headerAndPayload);
  const signature = sign.sign(credentials.private_key, 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const jwt = `${headerAndPayload}.${signature}`;

  // Exchange JWT for access token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function fetchExpertsFromSheet(spreadsheetId: string) {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is required');
  }

  const credentials: GoogleJWTCredentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const accessToken = await getAccessToken(credentials);

  // Fetch data using Google Sheets REST API
  const range = 'Experts!A:J';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch from Google Sheets: ${response.status} ${error}`);
  }

  const data = await response.json();
  const rows = data.values || [];

  if (rows.length === 0) {
    return [];
  }

  // Skip header row and map to expert objects
  const experts = rows.slice(1).map((row: string[]) => ({
    firstName: row[0] || '',
    lastName: row[1] || '',
    credentials: row[2] || '',
    email: row[3] || '',
    city: row[4] || '',
    state: row[5] || '',
    category: row[6] || '',
    group: row[7] || '',
    specialty: row[8] || '',
    isPublished: row[9] || ''
  }));

  // Filter only published experts
  return experts.filter(expert => 
    expert.isPublished.toLowerCase() === 'yes'
  );
}

export async function fetchContentSectionsFromSheet(spreadsheetId: string) {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is required');
  }

  const credentials: GoogleJWTCredentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const accessToken = await getAccessToken(credentials);

  // Fetch data using Google Sheets REST API
  const range = 'Content!A:F';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch from Google Sheets: ${response.status} ${error}`);
  }

  const data = await response.json();
  const rows = data.values || [];

  if (rows.length === 0) {
    return [];
  }

  // Skip header row and map to content section objects
  const sections = rows.slice(1).map((row: string[]) => ({
    title: row[0] || '',
    content: row[1] || '',
    order: parseInt(row[2] || '0', 10),
    type: row[3] || 'text',
    imageUrl: row[4] || '',
    secondaryContent: row[5] || ''
  }));

  // Sort by order
  return sections.sort((a, b) => a.order - b.order);
}
