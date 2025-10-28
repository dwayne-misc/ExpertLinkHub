import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Sheet not connected');
  }
  return accessToken;
}

export async function getUncachableGoogleSheetClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

export async function fetchExpertsFromSheet(spreadsheetId: string) {
  const sheets = await getUncachableGoogleSheetClient();
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Experts!A:I',
  });

  const rows = response.data.values;
  
  if (!rows || rows.length === 0) {
    return [];
  }

  const [header, ...dataRows] = rows;
  
  return dataRows.map(row => ({
    firstName: row[0] || '',
    lastName: row[1] || '',
    credentials: row[2] || '',
    email: row[3] || '',
    city: row[4] || '',
    state: row[5] || '',
    category: row[6] || '',
    group: row[7] || '',
    description: row[8] || '',
  })).filter(expert => expert.firstName && expert.email);
}

export async function fetchContentSectionsFromSheet(spreadsheetId: string) {
  try {
    const sheets = await getUncachableGoogleSheetClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Content!A:F',
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return [];
    }

    const [header, ...dataRows] = rows;
    
    return dataRows.map((row, index) => ({
      title: row[0] || '',
      content: row[1] || '',
      order: parseInt(row[2]) || index,
      type: row[3] || 'text',
      imageUrl: row[4] || '',
      secondaryContent: row[5] || '',
    })).filter(section => section.title || section.content || section.imageUrl)
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.log('Content sheet not found, skipping content sections');
    return [];
  }
}

export async function updateContentSheet(spreadsheetId: string, values: any[][]) {
  const sheets = await getUncachableGoogleSheetClient();
  
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Content!A:F',
    valueInputOption: 'RAW',
    requestBody: {
      values
    }
  });
}
