# Stories Directory

This directory contains Storybook stories for the application's UI components. These stories serve as living documentation and as an isolated environment for developing and testing UI components.

## Purpose

- Provide interactive examples of UI components
- Document component variations and states
- Enable isolated component development
- Facilitate visual testing and review

## Story Structure

Each story file follows a consistent pattern:

1. Import the component being documented
2. Define a default export with component metadata
3. Export named stories for different component variations

## Key Files

The directory includes stories for all major UI components, including:

### Button Components
- `button.stories.tsx`: Standard button variations
- `toggle.stories.tsx`: Toggle button component

### Form Components
- `input.stories.tsx`: Text input field
- `textarea.stories.tsx`: Multi-line text input
- `checkbox.stories.tsx`: Checkbox input
- `radio-group.stories.tsx`: Radio button groups
- `select.stories.tsx`: Dropdown select components

### Navigation Components
- `navigation-menu.stories.tsx`: Navigation menu
- `menubar.stories.tsx`: Menu bar component
- `tabs.stories.tsx`: Tabbed interface

### Layout Components
- `card.stories.tsx`: Card component
- `table.stories.tsx`: Table component
- `scroll-area.stories.tsx`: Scrollable container
- `sheet.stories.tsx`: Side sheet/drawer
- `separator.stories.tsx`: Content separator

### Dialog Components
- `dialog.stories.tsx`: Modal dialog
- `drawer.stories.tsx`: Slide-in drawer
- `popover.stories.tsx`: Popover component
- `dropdown-menu.stories.tsx`: Dropdown menu

### Feedback Components
- `alert.stories.tsx`: Alert messages
- `progress.stories.tsx`: Progress indicators
- `skeleton.stories.tsx`: Loading skeleton

### Miscellaneous Components
- `avatar.stories.tsx`: User avatars
- `badge.stories.tsx`: Status badges
- `calendar.stories.tsx`: Date picker calendar
- `hover-card.stories.tsx`: Hover information cards
- `tooltip.stories.tsx`: Tooltip component

## Story Format

Stories use the Component Story Format (CSF) with the following structure:

```tsx
// [build] library: 'shadcn'
import { Component } from "../components/ui/component";

const meta = {
  title: "ui/Component",
  component: Component,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

export const Variant1 = {
  render: (args: any) => <Component {...args}>Content</Component>,
  args: {
    variant: "primary",
  },
};

export const Variant2 = {
  render: (args: any) => <Component {...args}>Content</Component>,
  args: {
    variant: "secondary",
  },
};
```

## Usage

To view the stories in Storybook:

1. Run the Storybook development server:
   ```bash
   npm run storybook
   ```

2. Open your browser to the provided URL (typically http://localhost:6006)

3. Browse components in the left sidebar

4. Interact with components in the main panel

5. View component documentation in the "Docs" tab