import { google } from 'googleapis';

export async function getGoogleSheetsClient() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is required');
  }

  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  return google.sheets({ version: 'v4', auth });
}

export async function fetchExpertsFromSheet(spreadsheetId: string) {
  const sheets = await getGoogleSheetsClient();
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Experts!A:J',
  });

  const rows = response.data.values;
  
  if (!rows || rows.length === 0) {
    return [];
  }

  const [header, ...dataRows] = rows;
  
  return dataRows
    .filter(row => {
      const isPublished = (row[9] || '').toLowerCase() === 'yes';
      const hasRequiredFields = row[0] && row[3];
      return hasRequiredFields && isPublished;
    })
    .map(row => ({
      firstName: row[0] || '',
      lastName: row[1] || '',
      credentials: row[2] || '',
      email: row[3] || '',
      city: row[4] || '',
      state: row[5] || '',
      category: row[6] || '',
      group: row[7] || '',
      specialty: row[8] || '',
    }));
}

export async function fetchContentSectionsFromSheet(spreadsheetId: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    
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
    console.log('Content sheet not found, returning empty array');
    return [];
  }
}
