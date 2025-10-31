# Expert Directory Application

## Overview

This is an expert directory web application built to help users discover and connect with industry professionals across various categories including tax, legal, finance, and business consulting. The application features a searchable, filterable card-based interface that displays expert information pulled from Google Sheets, with a focus on utility and scannability.

## User Preferences

Preferred communication style: Simple, everyday language.

## Brand Customization

**ValuCompass Branding:**
- Primary Color: #1F406F (deep blue - used for buttons, links, accents)
- Primary Font: Montserrat (headings and body text)
- Secondary Font: Lato (available for secondary content)
- Logo: Sourced from https://discovervalucompass.github.io/experts/assets/images/vc_experts_logo.png

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) v5 for server state management
- **UI Components**: shadcn/ui component library (New York style variant)
- **Styling**: Tailwind CSS with custom design tokens and Material Design-inspired approach
- **Build Tool**: Vite for fast development and optimized production builds

**Design System**:
- Card-based layout optimized for information density
- Responsive grid system (1 column mobile, 2 columns tablet, 3 columns desktop)
- Category filters displayed in side-by-side sections (Growth/Protection) on desktop, stacked on mobile
- Pagination system: 6 experts per page with smart page number display (ellipsis for 100+ pages)
- Montserrat font family for primary typography (headings and body text)
- Lato font family available for secondary content
- Custom color system using HSL with CSS variables for theming support
- Spacing based on Tailwind's 2/4/6/8 unit system
- Content block system with 7 widget types for rich content composition

### Backend Architecture

**Runtime**: Node.js with Express.js
- **Language**: TypeScript compiled to ESM modules
- **API Pattern**: RESTful endpoints serving JSON
- **Data Validation**: Zod schemas for runtime type checking
- **Build Process**: esbuild for production bundling

**Server Structure**:
- Express middleware for JSON parsing and request logging
- Custom Vite integration for development with HMR
- Modular route registration pattern
- In-memory caching layer for performance optimization

### Data Storage Solutions

**Primary Data Source**: Google Sheets integration
- Real-time data fetching via Google Sheets API v4
- OAuth2 authentication using Replit Connectors
- 5-minute cache duration to balance freshness with API quota

**Caching Strategy**:
- In-memory storage implementation (`MemStorage` class)
- Automatic cache refresh on 5-minute intervals
- Fallback to cached data if Google Sheets API fails

**Expert Data Schema** (Experts!A:J):
```typescript
{
  firstName: string
  lastName: string
  credentials: string (optional, e.g., CPA, CFP)
  email: string (validated)
  city: string (optional)
  state: string (optional)
  category: string (main filter categories, e.g., Tax, Legal)
  group: string (TopLine field - Growth/Protection grouping)
  specialty: string (optional, expert specialty/focus area)
  isPublished: string (optional, "Yes" to show, "No" or empty to hide)
}
```

**Expert Categories Reference** (Expert Categories!A:B):
- Optional reference tab listing available categories and specialties
- Column A: Category name
- Column B: Specialty options
- Used for validation and reference when populating expert data

**Content Management System**: Google Sheets-based block/widget system (Content!A:F)
- **Content Schema**:
```typescript
{
  title: string
  content: string
  order: number (controls display sequence)
  type: string (widget type: text, image, hero, two-column, cards, image-text)
  imageUrl: string (optional, for visual widgets)
  secondaryContent: string (optional, for two-column layout)
}
```

**Supported Widget Types**:
1. **text**: Standard text content with optional title
2. **image**: Full-width image with caption (title used as caption)
3. **hero**: Large banner image (h-96) with overlaid title and content (dark gradient background)
4. **two-column**: Side-by-side layout with content + secondaryContent (responsive, stacks on mobile)
5. **cards**: Grid layout (3 cols desktop, 2 tablet, 1 mobile) - content split by double line breaks
6. **image-text**: Image alongside text content in 2-column layout

Content sections appear below expert listings, separated by divider, with 5-minute cache refresh.

### Authentication and Authorization

Currently implements read-only access with no user authentication. Authorization is handled at the infrastructure level through:

**Development (Replit)**:
- Replit's identity tokens (REPL_IDENTITY for development, WEB_REPL_RENEWAL for deployment)
- Google Sheets OAuth credentials managed via Replit Connectors
- Connection settings cached to minimize auth overhead

**Production (Vercel/External)**:
- Google Service Account authentication
- Service account JSON credentials stored in environment variable `GOOGLE_SERVICE_ACCOUNT_JSON`
- Read-only access to Google Sheets with `spreadsheets.readonly` scope
- Service account email must be granted Viewer access to the spreadsheet

### External Dependencies

**Third-Party Services**:
1. **Google Sheets API**: Primary data source
   - Spreadsheet ID: `1kRomUELKC_iLfW5OQFG-78mc8r8jQ1qujDhINhdygEg`
   - Experts!A:I: Expert directory data (9 columns)
   - Content!A:F: Content management blocks/widgets (6 columns)
   - Requires OAuth2 credentials via Replit Connectors
   - Rate-limited through 5-minute caching strategy for both datasets

2. **Replit Platform Services**:
   - Connector API for Google Sheets authentication
   - Development tooling (cartographer, dev banner, error overlay)
   - Identity/renewal tokens for secure API access

**UI Component Library**:
- Radix UI primitives (20+ components) for accessible, unstyled components
- Lucide React for iconography
- Embla Carousel for potential carousel functionality
- CMDK for command palette patterns

**Styling & Utilities**:
- Tailwind CSS v3 with PostCSS
- class-variance-authority for component variant management
- clsx & tailwind-merge for conditional class handling
- date-fns for date manipulation

**Developer Experience**:
- TypeScript for type safety across frontend/backend
- Drizzle ORM configured (PostgreSQL dialect) - note: database not currently in use but configured for future extension
- ESBuild for fast production builds
- TSX for TypeScript execution in development

## Deployment

The application supports deployment to multiple platforms with flexible authentication:

### Vercel Deployment

**Prerequisites**:
- Google Service Account with JSON credentials
- Service account email granted Viewer access to Google Sheet
- Vercel account with connected Git repository

**Environment Variables** (set in Vercel dashboard):
- `GOOGLE_SERVICE_ACCOUNT_JSON`: Full service account JSON as single-line string
- `SPREADSHEET_ID`: Google Sheets spreadsheet ID (default: `1kRomUELKC_iLfW5OQFG-78mc8r8jQ1qujDhINhdygEg`)
- `SESSION_SECRET`: Random secret for session management (optional)

**Build Configuration**:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

See `DEPLOYMENT.md` for detailed deployment instructions.

### Replit Deployment

Uses Replit's built-in Google Sheets connector for authentication. No additional environment variables required beyond the connector setup.

## Recent Changes

- **2025-10-31**: Added IsPublished column (Column J) - experts only display when set to "Yes"
- **2025-10-31**: Uniform card heights with reserved specialty area (3rem) for consistent layout
- **2025-10-31**: Refined diagonal ribbon design with overflow effect and smaller 9px font
- **2025-10-31**: Replaced "Description" field with "Specialty" field for expert profiles
- **2025-10-31**: Added Expert Categories reference tab documentation (Categories!A:B)
- **2025-10-31**: Added support for line breaks in specialty text using `whitespace-pre-wrap` CSS
- **2025-10-31**: Dual authentication support (Replit Connectors + Google Service Account) for flexible deployment
- **2025-10-31**: Added Vercel deployment configuration and documentation
- **2025-10-31**: Replaced `googleapis` npm package with lightweight REST API calls for Vercel compatibility
  - Fixes DNS_HOSTNAME_NOT_FOUND errors in serverless environment
  - Reduces bundle size and improves cold start performance
  - Uses direct Google Sheets REST API with JWT authentication
  - Inlined authentication logic directly in API endpoints to avoid module resolution issues
  - Successfully deployed to Vercel with Google Service Account authentication