# MUI to Shadcn/UI Migration

This directory contains documentation and examples for migrating from Material UI (MUI) to Shadcn/UI in our application.

## What's Included

- [Migration Guide](./mui-to-shadcn-migration.md): Comprehensive guide to replacing MUI components with Shadcn/UI equivalents
- Example component migration: See `src/components/compliance/issuer/onboarding/DocumentUploadMigrated.tsx` for a before/after example

## Migration Steps

1. Uninstall MUI dependencies:
   ```bash
   npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled
   ```

2. Install required Shadcn/UI components:
   ```bash
   # Run our installation script
   ./src/scripts/install-shadcn-components.sh
   
   # Or install individual components
   npx shadcn@latest add button
   npx shadcn@latest add input
   # etc.
   ```

3. Remove MUI ThemeProvider from `src/main.tsx`

4. For each component that uses MUI:
   - Replace MUI imports with Shadcn/UI component imports
   - Replace MUI components with their Shadcn/UI equivalents
   - Convert MUI styling (sx prop, makeStyles) to Tailwind CSS classes
   - Replace MUI icons with Lucide React icons

## Important Note

The `shadcn-ui` package is deprecated. Always use the `shadcn` package instead.

## Resources

- [Shadcn/UI Components](https://ui.shadcn.com/docs/components/accordion)
- [Shadcn CLI Documentation](https://ui.shadcn.com/docs/cli)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/)