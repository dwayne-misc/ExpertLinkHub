import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchExpertsFromSheet } from '../lib/googleSheets';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1kRomUELKC_iLfW5OQFG-78mc8r8jQ1qujDhINhdygEg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {
      hasServiceAccountJson: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      serviceAccountJsonLength: process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.length || 0,
      spreadsheetId: SPREADSHEET_ID,
    },
    tests: {}
  };

  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      diagnostics.tests.serviceAccount = {
        status: 'FAILED',
        error: 'GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set'
      };
    } else {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
        diagnostics.tests.serviceAccount = {
          status: 'PASSED',
          email: credentials.client_email,
          projectId: credentials.project_id
        };
      } catch (e: any) {
        diagnostics.tests.serviceAccount = {
          status: 'FAILED',
          error: 'Invalid JSON in GOOGLE_SERVICE_ACCOUNT_JSON: ' + e.message
        };
      }
    }

    try {
      diagnostics.tests.authSetup = {
        status: 'TESTING',
        message: 'Authenticating with Google Sheets API...'
      };
      
      const experts = await fetchExpertsFromSheet(SPREADSHEET_ID);
      
      diagnostics.tests.sheetsAccess = {
        status: 'PASSED',
        message: 'Successfully accessed spreadsheet and fetched experts',
        totalExperts: experts.length,
        sampleExpert: experts[0] ? {
          firstName: experts[0].firstName,
          lastName: experts[0].lastName,
          category: experts[0].category
        } : null
      };

    } catch (e: any) {
      diagnostics.tests.sheetsAccess = {
        status: 'FAILED',
        error: e.message,
        stack: e.stack
      };
    }

  } catch (e: any) {
    diagnostics.error = e.message;
  }

  const allPassed = Object.values(diagnostics.tests).every((test: any) => test.status === 'PASSED');
  
  return res.status(allPassed ? 200 : 500).json(diagnostics);
}
