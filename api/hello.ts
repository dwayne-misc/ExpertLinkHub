import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    message: 'Hello from Vercel!',
    timestamp: new Date().toISOString(),
    env: {
      hasServiceAccount: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      hasSpreadsheetId: !!process.env.SPREADSHEET_ID,
      nodeVersion: process.version
    }
  });
}
