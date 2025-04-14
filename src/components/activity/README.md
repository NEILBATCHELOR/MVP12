# Activity Components

## Overview
The Activity components handle user activity tracking, logging, monitoring, and visualization throughout the application. These components provide insights into user behavior and system events.

## Components

### Activity Tracking Components
- **ActivityMonitor.tsx**: Main component for monitoring and tracking user and system activities across the application.
- **ActivityLogProvider.tsx**: Context provider for activity logging functionality throughout the application.
- **RecentUserActivity.tsx**: Displays recent user activities in a timeline or list format.
- **ActivityMetrics.tsx**: Visualizes activity metrics and statistics in charts and graphs.

### Activity Log Components
- **EntityActivityLog.tsx**: Displays activity logs specific to a particular entity (e.g., project, investor).
- **ActivityLogDetails.tsx**: Shows detailed information about a specific activity log entry.

## Usage
These components are used throughout the application to track user actions, provide audit trails, and visualize user activity patterns. The ActivityLogProvider is typically included near the root of the application to enable activity tracking across all components.

## Dependencies
- React
- UI component library
- Data visualization libraries for activity metrics
- Date formatting utilities