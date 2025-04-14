# Storyboards Directory

This directory contains storyboard components that demonstrate complete features or workflows within the application. Unlike individual component stories, storyboards show how multiple components interact together to form a complete user experience.

## Purpose

- Demonstrate complete user workflows and experiences
- Showcase integration between components
- Provide working examples of complex features
- Facilitate end-to-end testing of functionality

## Key Files

### Authentication and Onboarding

- `login-modal-storyboard.tsx`: Demonstrates the login modal with different user types
- `investor-registration-storyboard.tsx`: Shows the investor registration flow

### Dashboard and Analytics

- `dashboard-metrics-storyboard.tsx`: Demonstrates dashboard metrics and visualizations
- `operations-dashboard-storyboard.tsx`: Shows the operations dashboard interface
- `investor-dashboard-storyboard.tsx`: Displays the investor dashboard experience

### Workflow and Process

- `redemption-workflow-storyboard.tsx`: Demonstrates the redemption process workflow
- `admin-bypass-storyboard.tsx`: Shows admin override functionality

### Components and UI

- `country-selector-storyboard.tsx`: Demonstrates the country selection component
- `country-selector-search-storyboard.tsx`: Shows the searchable country selector

### System and Configuration

- `app-routes-storyboard.tsx`: Displays application routing structure
- `database-debug-storyboard.tsx`: Tool for debugging database connections
- `connection-test-storyboard.tsx`: Tests connectivity to external services

### Wallet and Blockchain

- `new-wallet-storyboard.tsx`: Demonstrates wallet creation flow

## Structure and Organization

Each storyboard typically follows this structure:

1. Import necessary components and hooks
2. Define state variables for the demonstration
3. Create a component that shows the feature in action
4. Include user interaction elements to trigger different states

Example:
```tsx
import React, { useState } from "react";
import LoginModal from "@/components/auth/LoginModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginModalStoryboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"issuer" | "investor">("issuer");

  return (
    <div className="p-8 max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Login Modal Demo</h1>
        <p className="text-gray-600 mb-6">
          Click the buttons below to open the login modal with different default
          tabs.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "issuer" | "investor")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="issuer">Issuer</TabsTrigger>
          <TabsTrigger value="investor">Investor</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex justify-center">
        <Button onClick={() => setIsOpen(true)}>
          Open {activeTab === "issuer" ? "Issuer" : "Investor"} Login Modal
        </Button>
      </div>

      <LoginModal
        open={isOpen}
        onOpenChange={setIsOpen}
        defaultTab={activeTab}
      />
    </div>
  );
}
```

## Usage

Storyboards can be:

1. Viewed in isolation during development
2. Used for stakeholder demonstrations
3. Leveraged for end-to-end testing
4. Used as reference for implementing features

To view storyboards:

1. Import the storyboard into a development page
2. Navigate to the route that renders the storyboard
3. Interact with the storyboard to see the feature in action