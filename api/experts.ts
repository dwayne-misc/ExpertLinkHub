import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchExpertsFromSheet } from '../lib/googleSheets';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1kRomUELKC_iLfW5OQFG-78mc8r8jQ1qujDhINhdygEg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const experts = await fetchExpertsFromSheet(SPREADSHEET_ID);
    
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    
    console.log(`Successfully fetched ${experts.length} experts`);
    return res.status(200).json(experts);
  } catch (error: any) {
    console.error('Error fetching experts:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return res.status(500).json({ 
      message: 'Failed to fetch experts',
      error: error.message,
      code: error.code,
      spreadsheetId: SPREADSHEET_ID,
      hasServiceAccount: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    });
  }
}
