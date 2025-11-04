# Vercel Deployment Guide

This guide will help you deploy the ValuCompass Expert Directory to Vercel.

## Architecture Overview

The application is configured for Vercel's serverless platform:
- **Frontend**: Static files built with Vite, served from `dist/public`
- **API Routes**: Serverless functions in `api/` directory
  - `/api/experts` - Fetches expert data from Google Sheets
  - `/api/content` - Fetches content sections from Google Sheets
  - `/api/categories` - Fetches category/specialty options for registration form
  - `/api/submit-expert` - Handles expert registration submissions
- **Client-Side Routing**: All non-API routes are rewritten to `index.html` to enable React router (wouter) to handle routes like `/register`
- **Data Caching**: Vercel's edge caching with 5-minute revalidation

## Prerequisites

1. A [Vercel account](https://vercel.com)
2. Your Google Service Account JSON credentials file
3. The Google Sheets Spreadsheet ID

## Step 1: Prepare Your Repository

Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect the configuration

## Step 3: Configure Environment Variables

In the Vercel project settings, add the following environment variables:

### Required Variables

**GOOGLE_SERVICE_ACCOUNT_JSON**
- Your entire Google Service Account JSON file as a single-line string
- To convert the JSON file to a single line, use this command:
  ```bash
  cat your-service-account.json | tr -d '\n'
  ```
- Or manually remove all line breaks and paste the entire JSON object
- Example value: `{"type":"service_account","project_id":"your-project",...}`

**SPREADSHEET_ID**
- Your Google Sheets Spreadsheet ID
- Default: `1kRomUELKC_iLfW5OQFG-78mc8r8jQ1qujDhINhdygEg`
- You can find this in your Google Sheets URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### Optional Variables

**SESSION_SECRET**
- A random secret for session management
- Generate with: `openssl rand -base64 32`
- If not provided, a default will be used

## Step 4: Configure Google Sheets Permissions

Make sure your Google Sheet is shared with the service account email:

1. Open your Google Sheet
2. Click "Share" in the top right
3. Add the service account email (found in your JSON file as `client_email`)
   - Example: `miscvaluecompass@kickga.iam.gserviceaccount.com`
4. Grant "Viewer" access (read-only is sufficient)

## Step 5: Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your site will be live at `your-project.vercel.app`

## Build Configuration

The project is configured in `vercel.json`:

- **Build Command**: `npm run build`
  - Builds the frontend with Vite to `dist/public`
  - Bundles serverless functions from `api/` directory
- **Output Directory**: `dist/public` (static frontend files)
- **Install Command**: `npm install`
- **API Routes**: Automatically deployed from `api/` directory as serverless functions

## Troubleshooting

### Step 1: Verify Environment Variables

Ensure these are set in Vercel Dashboard → Settings → Environment Variables:
- `GOOGLE_SERVICE_ACCOUNT_JSON` - Your service account JSON as a **single-line** string
- `SPREADSHEET_ID` - Your Google Sheets ID (default: `1kRomUELKC_iLfW5OQFG-78mc8r8jQ1qujDhINhdygEg`)

**Common Issues Found by Diagnostics:**

**Problem**: `GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set`
- **Solution**: Add the environment variable in Vercel dashboard → Settings → Environment Variables

**Problem**: `Invalid JSON in GOOGLE_SERVICE_ACCOUNT_JSON` or "Unterminated string in JSON"
- **Solution**: Make sure the JSON is on a **single line** with no line breaks
  ```bash
  # Option 1: Using jq (recommended)
  cat your-service-account.json | jq -c
  
  # Option 2: Remove newlines
  cat your-service-account.json | tr -d '\n'
  ```
- Then copy the output and paste into Vercel environment variable

**Problem**: `Google Sheets API has not been used in project ... or it is disabled`
- **Solution**: Enable the Google Sheets API for your service account's project
  1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/library/sheets.googleapis.com)
  2. Select your project
  3. Click "Enable API"
  4. Wait 2-3 minutes for propagation

**Problem**: `The caller does not have permission`
- **Solution**: Share the Google Sheet with the service account email (shown in diagnostics)
  1. Open your Google Sheet
  2. Click "Share"
  3. Add the service account email (e.g., `name@project.iam.gserviceaccount.com`)
  4. Grant "Viewer" access

**Problem**: `Requested entity was not found`
- **Solution**: Check that `SPREADSHEET_ID` matches your Google Sheet URL

### Step 2: Check Function Logs

If diagnostics pass but data still doesn't load:

1. Go to Vercel dashboard → Your project → Logs
2. Look for errors in `/api/experts` or `/api/content`
3. Check for detailed error messages in the logs

### Build Fails

- Check that all environment variables are set correctly
- Verify the `GOOGLE_SERVICE_ACCOUNT_JSON` is properly formatted as a single-line JSON string
- Review build logs in Vercel dashboard

### Google Sheets Not Loading

- Verify the service account email has access to the Google Sheet
- Check that `SPREADSHEET_ID` is correct
- Ensure the Google Sheets API is enabled in your Google Cloud project
- Verify the service account has the correct scopes enabled

### 500 Internal Server Error

- Check Vercel function logs in the dashboard
- Verify all environment variables are set
- Ensure the JSON credentials are valid

## Custom Domain

To add a custom domain:

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your domain and follow DNS configuration steps

## Continuous Deployment

Vercel automatically deploys when you push to your main branch. To deploy from a different branch:

1. Go to project settings
2. Under "Git", configure the production branch

## Local Testing with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run locally with production environment
vercel dev
```

## Support

For issues specific to:
- **Vercel Platform**: [Vercel Documentation](https://vercel.com/docs)
- **Google Sheets API**: [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- **Application Code**: Check the main README.md
