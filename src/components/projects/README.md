# Projects Components

## Overview
The Projects components handle project creation, management, listing, and visualization. These components form the project management foundation of the application.

## Components

### Core Project Components
- **ProjectsList.tsx**: Main component for displaying a list of projects with filtering and sorting capabilities.
- **ProjectCard.tsx**: Card component for displaying project summary information with links to Investors and Design sections.
- **ProjectDialog.tsx**: Dialog for creating and editing project information.
- **DeleteConfirmationDialog.tsx**: Confirmation dialog for project deletion.

## Features
- Project creation with name, description, status, project type, and token symbol
- Filtering projects by status and type
- Search functionality for finding specific projects
- Direct navigation to Investors and Token Design sections from project cards

## User Interface
- Project cards display key information including:
  - Project name and status
  - Project type and token symbol
  - Description
  - Investor count and total raised amount
  - Creation and update dates
- Actions for each project:
  - Edit and delete project
  - Navigate to Investors section
  - Navigate to Token Design section

## Dependencies
- React
- React Router
- UI component library (shadcn/ui)
- Form validation (React Hook Form & Zod)
- Project data services (Supabase)
- Lucide React (for icons)