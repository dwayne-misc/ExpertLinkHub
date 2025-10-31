import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchContentSectionsFromSheet } from '../lib/googleSheets';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1kRomUELKC_iLfW5OQFG-78mc8r8jQ1qujDhINhdygEg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const contentSections = await fetchContentSectionsFromSheet(SPREADSHEET_ID);
    
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    
    return res.status(200).json(contentSections);
  } catch (error: any) {
    console.error('Error fetching content:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch content sections',
      error: error.message 
    });
  }
}
