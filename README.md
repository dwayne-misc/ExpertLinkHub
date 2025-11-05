# ValuCompass Expert Directory

A dynamic, single-page expert directory website that pulls data from Google Sheets with real-time updates, search/filter functionality, and a flexible content management system.

## 🌟 Features

- **Dynamic Expert Cards**: Displays professional profiles with credentials, location, category, and specialty
- **Website Links**: Globe icon on expert cards links directly to their website (when provided)
- **Smart Filtering**: Filter experts by category and Growth/Protection grouping
- **Search Functionality**: Real-time search across names, credentials, and specialties
- **Pagination**: Clean pagination system (6 experts per page) with smart page number display
- **Visual Categorization**: Diagonal ribbon design distinguishing Growth vs. Protection experts
- **Expert Registration Form**: Self-service registration at `/register` with:
  - Cascading category/specialty dropdowns (1-3 specialty limit)
  - Required City/State fields with full state names
  - Flexible URL input (accepts with or without http://)
  - Automatic TopLine (Growth/Protection) assignment
- **Flexible CMS**: Contentful-style block system for managing page content directly in Google Sheets
- **Auto-Refresh**: 5-minute cache with automatic updates when spreadsheet changes
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dual Deployment**: Runs on both Replit (development) and Vercel (production)

## 📊 Data Structure 

### Google Sheets Configuration

**Spreadsheet ID**: `1kRomUELKC_iLfW5OQFG-78mc8r8jQ1qujDhINhdygEg`

The application reads from three tabs in the Google Spreadsheet:

---

### 1. **Experts Sheet** (Range: `Experts!A:K`)

This is the primary data source for expert profiles.

| Column | Field Name | Type | Required | Description | Example |
|--------|------------|------|----------|-------------|---------|
| A | First Name | Text | Yes | Expert's first name | `John` |
| B | Last Name | Text | Yes | Expert's last name | `Smith` |
| C | Credentials | Text | No | Professional credentials (CPA, CFP, etc.) | `CPA` |
| D | Email | Email | Yes | Contact email address | `john@example.com` |
| E | City | Text | Yes | City location (full name) | `Atlanta` |
| F | State | Text | Yes | State name (full name, not abbreviation) | `Georgia` |
| G | Category | Text | Yes | Professional category (used for filtering) | `Accounting / Tax` |
| H | TopLine (Group) | Text | Yes | Growth or Protection grouping | `Growth` or `Protection` |
| I | Specialty | Text | No | Area of expertise (supports line breaks) | `Business Valuation` |
| J | IsPublished | Text | Yes | Visibility control | `Yes` or `No` |
| K | URL | URL | No | Expert's website URL (auto-normalized to https://) | `https://www.example.com` |

**Important Notes:**
- **IsPublished**: Only experts with `Yes` (case-insensitive) in this column will appear on the website
- **TopLine/Group**: Must be either `Growth` or `Protection` - determines the diagonal ribbon color
- **Specialty**: Supports multi-line text (use Alt+Enter in Google Sheets for line breaks)
- **City & State**: Both required fields (full names, not abbreviations)
- **URL**: Optional website URL - accepts both formats:
  - `www.example.com` (auto-normalized to `https://www.example.com`)
  - `https://www.example.com` (stored as-is)
  - When URL exists, a globe icon appears on expert card linking to their website
- **Category**: Used for filter buttons - common values include:
  - `Business Consulting`
  - `Financial Planner`
  - `Accounting / Tax`
  - `Benefits / 401k`
  - `Insurance / Protection`
  - `Wealth Management / AUM`
  - `Legal`

**Header Row** (Row 1): `First Name | Last Name | Credentials | Email | City | State | Category | TopLine | Specialty | IsPublished | URL`

---

### 2. **Content Sheet** (Range: `Content!A:F`)

This tab manages all content sections below the expert directory using a flexible block/widget system.

| Column | Field Name | Type | Required | Description | Example |
|--------|------------|------|----------|-------------|---------|
| A | Title | Text | No* | Section heading or caption | `Our Services` |
| B | Content | Text | Yes | Main text content | `We provide expert guidance...` |
| C | Order | Number | Yes | Display sequence (ascending) | `1`, `2`, `3` |
| D | Type | Text | Yes | Widget type (see below) | `hero`, `text`, `image` |
| E | Image URL | URL | No* | Image source URL | `https://...` |
| F | Secondary Content | Text | No* | Additional content for layouts | `Column 2 text` |

**Header Row** (Row 1): `Title | Content | Order | Type | Image URL | Secondary Content`

---

### 3. **Expert Categories Sheet** (Range: `Expert Categories!A:C`)

Reference tab that populates the registration form dropdowns.

| Column | Field Name | Type | Description | Example |
|--------|------------|------|-------------|---------|
| A | Category | Text | Category name (matches Expert sheet Column G) | `Business Consulting` |
| B | Specialty | Text | Specific expertise area within the category | `Strategic Planning` |
| C | TopLine | Text | Growth or Protection grouping | `Growth` |

**Structure Example:**
```
Category              | Specialty              | TopLine
Business Consulting   | Strategic Planning     | Growth
Business Consulting   | Operations             | Growth
Marketing             | Digital Marketing      | Growth
Legal                 | Contract Law           | Protection
Accounting / Tax      | Tax Planning           | Protection
```

**How It Works:**
- Each category can have multiple rows (one per specialty)
- The registration form groups specialties by category
- TopLine is auto-assigned to new experts based on their selected category
- Multiple rows with the same category name = multiple specialty options

**Purpose**: Populates the registration form category dropdown and cascading specialty checkboxes.

---

## 🎨 Content Widget Types

The CMS system supports 6 different widget types for flexible page layouts:

### 1. **Text Block** (`type: "text"`)
Standard text content with optional heading.

**Uses:**
- Title (optional)
- Content (required)

**Example:**
```
Title: "About Our Network"
Content: "We connect business owners with trusted advisors..."
Type: "text"
```

---

### 2. **Image Block** (`type: "image"`)
Full-width image with caption.

**Uses:**
- Title (used as caption/alt text)
- Image URL (required)

**Example:**
```
Title: "Our Team of Experts"
Image URL: "https://example.com/team.jpg"
Type: "image"
```

---

### 3. **Hero Banner** (`type: "hero"`)
Large banner image with overlaid text (dark gradient background for readability).

**Uses:**
- Title (overlaid heading)
- Content (overlaid description)
- Image URL (required)

**Styling:**
- Height: 384px (96 in Tailwind units)
- Background: Dark gradient overlay
- Text: White with primary button

**Example:**
```
Title: "Expert Guidance for Business Growth"
Content: "Connect with industry-leading professionals"
Image URL: "https://example.com/hero.jpg"
Type: "hero"
```

---

### 4. **Two-Column Layout** (`type: "two-column"`)
Side-by-side content sections (stacks on mobile).

**Uses:**
- Title (optional section heading)
- Content (left column)
- Secondary Content (right column)

**Example:**
```
Title: "Our Approach"
Content: "We believe in personalized service..."
Secondary Content: "Our experts bring decades of experience..."
Type: "two-column"
```

---

### 5. **Card Grid** (`type: "cards"`)
Responsive grid of cards (3 columns desktop, 2 tablet, 1 mobile).

**Uses:**
- Title (grid heading)
- Content (card items separated by double line breaks)

**Format Content Like This:**
```
First Card Title
First card description text.

Second Card Title
Second card description text.

Third Card Title
Third card description text.
```

**Example:**
```
Title: "Our Services"
Content: "Business Consulting
Expert guidance for strategic planning.

Tax Advisory
Comprehensive tax strategies.

Legal Support
Corporate and contract law."
Type: "cards"
```

---

### 6. **Image + Text** (`type: "image-text"`)
Image alongside text in two-column layout.

**Uses:**
- Title (optional heading)
- Content (text content)
- Image URL (required)

**Layout:** Image on left, text on right (stacks on mobile)

**Example:**
```
Title: "Why Choose Us"
Content: "Our network includes certified professionals..."
Image URL: "https://example.com/why-us.jpg"
Type: "image-text"
```

---

## 🚀 Deployment

### Option 1: Replit (Development)

**Authentication:** Uses Replit's Google Sheets Connector

**Environment Variables:**
- `SESSION_SECRET` - Auto-generated session secret
- Connector handles Google Sheets authentication automatically

**How to Deploy:**
1. Fork/clone this repository to Replit
2. Configure Google Sheets connector in the Replit dashboard
3. Click "Run" - the app starts on port 5000
4. Access at `https://your-repl.replit.dev`

---

### Option 2: Vercel (Production)

**Authentication:** Uses Google Service Account

**Prerequisites:**
1. Google Cloud project with Sheets API enabled
2. Service Account with JSON credentials
3. Service account email granted Viewer access to the spreadsheet

**Environment Variables:**
Set these in Vercel Dashboard → Settings → Environment Variables:

- `GOOGLE_SERVICE_ACCOUNT_JSON` - Service account JSON as **single-line string**
- `SPREADSHEET_ID` - Your Google Sheets ID (optional, defaults to ValuCompass sheet)

**How to Deploy:**

1. **Create Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts)
   - Create new service account
   - Create and download JSON key

2. **Enable Google Sheets API:**
   - Visit [Google Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com)
   - Select your project
   - Click "Enable"

3. **Share Spreadsheet:**
   - Open your Google Sheet
   - Click "Share"
   - Add service account email (e.g., `name@project.iam.gserviceaccount.com`)
   - Grant "Viewer" permission

4. **Format Service Account JSON:**
   ```bash
   # Convert to single-line (use one of these methods)
   cat service-account.json | jq -c
   # OR
   cat service-account.json | tr -d '\n'
   ```

5. **Deploy to Vercel:**
   - Connect GitHub repository to Vercel
   - Add environment variables
   - Deploy!

**Build Configuration:**
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

For detailed troubleshooting, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🛠️ Technical Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Wouter for routing
- TanStack Query for data fetching
- shadcn/ui component library

**Backend:**
- Node.js + Express.js
- Google Sheets REST API v4
- JWT authentication for service accounts
- In-memory caching (5-minute TTL)

**Deployment:**
- Replit: Express server with Vite HMR
- Vercel: Serverless functions + static frontend

---

## 📝 How to Update Content

### Expert Registration Form

The easiest way for new experts to join the directory is through the self-service registration form at `/register`:

1. Navigate to `https://your-domain.com/register`
2. Fill out the form:
   - **First Name & Last Name** (required) - Expert's full name
   - **Credentials** (optional) - Professional designations (CPA, CFP, JD, etc.)
   - **Email** (required) - Contact email address
   - **Website** (optional) - Expert's website URL
     - Accepts both formats: `www.example.com` or `https://www.example.com`
     - Automatically normalized to include `https://` protocol in database
   - **City & State** (required) - Full city name and state name (not abbreviations)
   - **Category** (required) - Select from dropdown (automatically sets Growth/Protection grouping)
   - **Specialties** (required) - Select 1-3 specialties from checkboxes
     - Checkboxes disable after 3 selections
     - Must select at least 1, maximum 3
3. Submit the form
4. New entry is added to the spreadsheet with `IsPublished: No`
5. Admin reviews and changes `IsPublished` to `Yes` to make the expert visible

**Note**: The TopLine (Growth/Protection) field is automatically assigned based on the selected category, as defined in the Expert Categories sheet.

### Adding a New Expert (Manual)

1. Open the Google Sheet
2. Go to "Experts" tab
3. Add a new row with all required fields:
   - **Required**: First Name, Last Name, Email, City, State (full names), Category, TopLine/Group, IsPublished (`Yes`)
   - **Optional**: Credentials, Specialty, URL
   - **URL Format**: Can enter as `www.example.com` or `https://www.example.com` (both work)
4. Wait up to 5 minutes for cache refresh, or restart the application

### Hiding an Expert

1. Find the expert's row in the "Experts" tab
2. Change "IsPublished" column to `No` (or delete the value)
3. Expert will disappear within 5 minutes

### Adding Content Sections

1. Go to "Content" tab
2. Add a new row:
   - Choose a widget Type (text, image, hero, two-column, cards, image-text)
   - Set Order number (determines position on page)
   - Fill in required fields based on widget type
3. Content appears below expert directory within 5 minutes

### Reordering Content

1. Modify the "Order" column values
2. Lower numbers appear first
3. Changes reflect within 5 minutes

---

## 🎨 Branding

**ValuCompass Brand Identity:**
- Primary Color: `#1F406F` (deep blue)
- Primary Font: Montserrat
- Secondary Font: Lato
- Logo: ValuCompass Experts logo with compass star icon
  - Displayed in header on all pages
  - Clickable on home page (navigates to home/refreshes data)

**Design Features:**
- Card-based layout with consistent spacing
- Diagonal ribbons for Growth (blue) / Protection (purple) categorization
- Globe icon in upper right corner of cards when expert has website
- Responsive grid (3→2→1 columns)
- 6 experts per page with smart pagination
- Material Design-inspired elevation and shadows
- Footer with copyright notice on all pages

---

## 📋 Common Categories

Based on current expert data, these categories are in use:

- **Business Consulting** (Growth)
- **Financial Planner** (Protection)
- **Accounting / Tax** (Protection)
- **Benefits / 401k** (Protection)
- **Insurance / Protection** (Protection)
- **Wealth Management / AUM** (Protection)
- **Legal** (Protection)

Categories are user-defined and can be customized directly in the spreadsheet.

---

## 🔧 Development

**Start Development Server:**
```bash
npm install
npm run dev
```

**Build for Production:**
```bash
npm run build
```

**Project Structure:**
```
├── api/                    # Vercel serverless functions
│   ├── experts.ts         # Expert data endpoint
│   └── content.ts         # Content sections endpoint
├── client/                # Frontend application
│   └── src/
│       ├── pages/         # Page components
│       ├── components/    # Reusable UI components
│       └── lib/           # Utilities and hooks
├── server/                # Express backend (Replit)
│   ├── routes.ts          # API routes
│   └── googleSheets.ts    # Google Sheets integration
├── shared/                # Shared types and schemas
│   └── schema.ts          # Data models
└── vercel.json           # Vercel deployment config
```

---

## 📞 Support

For questions about:
- **Google Sheets structure**: Refer to field mappings above
- **Content updates**: See "How to Update Content" section
- **Deployment issues**: Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Technical details**: See [replit.md](./replit.md)

---

## 📄 License

Copyright © 2025 ValuCompass. All rights reserved.
