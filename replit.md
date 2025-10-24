# Expert Directory Application

## Overview

This is an expert directory web application built to help users discover and connect with industry professionals across various categories including tax, legal, finance, and business consulting. The application features a searchable, filterable card-based interface that displays expert information pulled from Google Sheets, with a focus on utility and scannability.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- Inter font family for consistent typography
- Custom color system using HSL with CSS variables for theming support
- Spacing based on Tailwind's 2/4/6/8 unit system

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

**Data Schema**:
```typescript
{
  firstName: string
  lastName: string
  email: string (validated)
  category: string
}
```

### Authentication and Authorization

Currently implements read-only access with no user authentication. Authorization is handled at the infrastructure level through:
- Replit's identity tokens (REPL_IDENTITY for development, WEB_REPL_RENEWAL for deployment)
- Google Sheets OAuth credentials managed via Replit Connectors
- Connection settings cached to minimize auth overhead

### External Dependencies

**Third-Party Services**:
1. **Google Sheets API**: Primary data source
   - Spreadsheet ID: `1kRomUELKC_iLfW5OQFG-78mc8r8jQ1qujDhINhdygEg`
   - Requires OAuth2 credentials via Replit Connectors
   - Rate-limited through caching strategy

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