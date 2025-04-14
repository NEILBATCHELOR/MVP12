# MUI to Shadcn/UI Migration Guide

This document outlines how to migrate from Material UI (MUI) components to Shadcn/UI components.

## Component Installation

To add shadcn/ui components to your project, use the latest shadcn CLI:

```bash
# Install a single component
npx shadcn@latest add button

# Use our script to install all components
./src/scripts/install-shadcn-components.sh
```

> **Note**: The `shadcn-ui` package is deprecated. Always use `shadcn` instead.

## Basic Component Mapping

| MUI Component | Shadcn/UI Component | Notes |
|--------------|---------------------|-------|
| `<Button>` | `<Button>` | Import from '@/components/ui/button' |
| `<TextField>` | `<Input>` | Import from '@/components/ui/input' |
| `<Typography>` | Use Tailwind classes | e.g., `<p className="text-lg font-medium">` |
| `<Card>` | `<Card>` | Import from '@/components/ui/card' |
| `<Dialog>` | `<Dialog>` | Import from '@/components/ui/dialog' |
| `<Grid>` | Use Tailwind grid | e.g., `<div className="grid grid-cols-12 gap-4">` |
| `<Box>` | Use plain `<div>` | With Tailwind classes |
| `<Select>` | `<Select>` | Import from '@/components/ui/select' |
| `<Checkbox>` | `<Checkbox>` | Import from '@/components/ui/checkbox' |
| `<Switch>` | `<Switch>` | Import from '@/components/ui/switch' |
| `<Table>` | `<Table>` | Import from '@/components/ui/table' |
| `<Tabs>` | `<Tabs>` | Import from '@/components/ui/tabs' |
| `<Paper>` | `<Card>` or `<div>` | With appropriate Tailwind classes |
| `<CircularProgress>` | `<Spinner>` | Create a custom spinner component |
| `<Alert>` | `<Alert>` | Import from '@/components/ui/alert' |
| `<Snackbar>` | `<Toast>` | Import from '@/components/ui/toast' |

## Icons Replacement

Replace MUI icons with Lucide React icons:

```jsx
// Before (MUI)
import { DeleteIcon } from '@mui/icons-material';

// After (Lucide)
import { Trash } from 'lucide-react';
```

## Theme Migration

The theme has been migrated from MUI's theme system to Tailwind CSS and Shadcn/UI's theming approach:

- Colors are defined in the Tailwind config
- Component variants use class-variance-authority
- Global styles are in the index.css file

## Example Migration

### Before (MUI):

```jsx
import { Button, TextField, Typography, Box } from '@mui/material';

function MyComponent() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4">Hello World</Typography>
      <TextField label="Name" variant="outlined" />
      <Button variant="contained" color="primary">
        Submit
      </Button>
    </Box>
  );
}
```

### After (Shadcn/UI):

```jsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function MyComponent() {
  return (
    <div className="p-4">
      <h4 className="text-2xl font-bold mb-4">Hello World</h4>
      <div className="space-y-4">
        <Input placeholder="Name" />
        <Button>Submit</Button>
      </div>
    </div>
  );
}
```

## Component Replacement Process

1. Identify MUI components in a file
2. Find the equivalent Shadcn/UI component
3. Update imports
4. Replace component usage with Shadcn/UI equivalent
5. Convert MUI styling to Tailwind classes

## Styling Differences

MUI uses a styling system based on JSS, while Shadcn/UI leverages Tailwind CSS. Here's how to convert common styling patterns:

### Spacing

- MUI: `<Box sx={{ p: 2, m: 1 }}>`
- Shadcn/UI: `<div className="p-4 m-2">`

### Colors

- MUI: `<Button color="primary">`
- Shadcn/UI: `<Button variant="default">`

### Typography

- MUI: `<Typography variant="h1">`
- Shadcn/UI: `<h1 className="text-4xl font-bold">`

## Resources

- [Shadcn/UI Documentation](https://ui.shadcn.com/)
- [Shadcn CLI Documentation](https://ui.shadcn.com/docs/cli)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons/)