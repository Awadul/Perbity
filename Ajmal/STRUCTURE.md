# Project Structure

This document describes the file and folder structure of the Ajmal project.

## Directory Structure

```
ajmal/
├── public/                 # Static assets
├── src/                   # Source code
│   ├── assets/           # Images, fonts, etc.
│   ├── components/       # React components
│   │   ├── common/      # Reusable components (Button, Input, etc.)
│   │   └── layout/      # Layout components (Header, Footer, etc.)
│   ├── config/          # Configuration files
│   ├── constants/       # Application constants
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── services/        # API services and external integrations
│   ├── styles/          # Global styles and CSS variables
│   └── utils/           # Utility functions
├── tests/               # Test files
├── .env.example        # Example environment variables
├── .gitignore          # Git ignore rules
├── eslint.config.js    # ESLint configuration
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── README.md           # Project documentation
├── STRUCTURE.md        # This file
└── vite.config.js      # Vite configuration
```

## Folder Descriptions

### `/src/components`
Reusable React components organized by category:
- **common/**: Generic reusable components (buttons, inputs, cards, etc.)
- **layout/**: Layout components (header, footer, sidebar, etc.)

### `/src/pages`
Page-level components representing different routes in the application.

### `/src/hooks`
Custom React hooks for shared logic:
- `useLocalStorage.js`: Hook for localStorage management
- `useFetch.js`: Hook for API data fetching

### `/src/context`
React Context providers for global state management.

### `/src/services`
API services and external integrations:
- `api.js`: Base API service with HTTP methods

### `/src/utils`
Utility functions:
- `helpers.js`: General helper functions
- `validators.js`: Input validation functions

### `/src/constants`
Application-wide constants and configurations.

### `/src/config`
Environment-specific configuration files.

### `/src/styles`
Global styles and CSS variables:
- `variables.css`: CSS custom properties

### `/tests`
Test files and test configuration.

## Naming Conventions

- **Components**: PascalCase (e.g., `Button.jsx`, `Header.jsx`)
- **Utilities**: camelCase (e.g., `helpers.js`, `validators.js`)
- **Hooks**: camelCase with `use` prefix (e.g., `useFetch.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **CSS files**: Match component name (e.g., `Button.css` for `Button.jsx`)

## Import Structure

Use index files for cleaner imports:
```javascript
// Instead of:
import Button from './components/common/Button';

// Use:
import { Button } from './components';
```

## Environment Variables

Copy `.env.example` to `.env` and configure your environment variables:
```bash
cp .env.example .env
```

All environment variables should be prefixed with `VITE_` to be accessible in the application.

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Best Practices

1. Keep components small and focused
2. Use custom hooks for reusable logic
3. Store constants in `/constants` directory
4. Use CSS modules or styled-components for component-specific styles
5. Write tests for critical functionality
6. Document complex functions and components
7. Follow consistent naming conventions
8. Use TypeScript for better type safety (recommended)
