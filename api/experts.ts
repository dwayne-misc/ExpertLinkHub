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
    
    return res.status(200).json(experts);
  } catch (error: any) {
    console.error('Error fetching experts:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch experts',
      error: error.message 
    });
  }
}
