# Vercel Deployment Guide

This guide will help you deploy the ValuCompass Expert Directory to Vercel.

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

The project uses these build commands (already configured in `package.json`):

- **Build Command**: `npm run build`
  - Builds the frontend with Vite
  - Bundles the backend with esbuild
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Troubleshooting

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
