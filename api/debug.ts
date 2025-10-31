import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGoogleSheetsClient } from '../lib/googleSheets';

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
      const sheets = await getGoogleSheetsClient();
      diagnostics.tests.sheetsClient = {
        status: 'PASSED',
        message: 'Google Sheets client created successfully'
      };

      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Experts!A1:J1',
        });

        diagnostics.tests.sheetsAccess = {
          status: 'PASSED',
          message: 'Successfully accessed spreadsheet',
          headerRow: response.data.values?.[0] || []
        };

        const fullResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Experts!A:J',
        });

        const rowCount = (fullResponse.data.values?.length || 0) - 1;
        diagnostics.tests.dataFetch = {
          status: 'PASSED',
          totalRows: rowCount,
          message: `Found ${rowCount} expert rows (excluding header)`
        };

      } catch (e: any) {
        diagnostics.tests.sheetsAccess = {
          status: 'FAILED',
          error: e.message,
          code: e.code,
          details: e.errors?.[0]?.message || 'No additional details'
        };
      }

    } catch (e: any) {
      diagnostics.tests.sheetsClient = {
        status: 'FAILED',
        error: e.message
      };
    }

  } catch (e: any) {
    diagnostics.error = e.message;
  }

  const allPassed = Object.values(diagnostics.tests).every((test: any) => test.status === 'PASSED');
  
  return res.status(allPassed ? 200 : 500).json(diagnostics);
}
