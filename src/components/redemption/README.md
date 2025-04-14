# Redemption Components

## Overview
The Redemption components handle token redemption processes, multi-signature approval workflows, transaction history, and status tracking. These components manage the conversion of tokens back to underlying assets or fiat currency.

## Components

### Core Redemption Components
- **RedemptionForm.tsx**: Form for initiating token redemption requests.
- **RedemptionDetails.tsx**: Displays detailed information about a redemption request.
- **RedemptionSummary.tsx**: Summarizes key information about a redemption transaction.
- **RedemptionRequestList.tsx**: Lists all redemption requests with filtering and sorting.
- **RedemptionDashboard.tsx**: Main dashboard for viewing and managing redemptions.
- **RedemptionStatusDemo.tsx**: Demonstration component showing redemption status flow.
- **RedemptionStatusSubscriber.tsx**: Component that subscribes to status updates for redemptions.

### Approval and Workflow Components
- **ApproverDashboard.tsx**: Dashboard for approvers to review and approve redemption requests.
- **ApproverList.tsx**: Displays a list of approvers for a redemption request.
- **MultiSignatureWorkflow.tsx**: Manages multi-signature approval processes.
- **RoleSelection.tsx**: Component for selecting user roles in the approval process.
- **ApprovalVisualization.tsx**: Visual representation of the approval workflow.

### Transaction Components
- **TransactionHistory.tsx**: Displays the history of redemption transactions.
- **TransactionDetailsPanel.tsx**: Shows detailed information about a specific transaction.
- **ExportButton.tsx**: Button for exporting redemption transaction data.

### Status Tracking
- **StatusTracker.tsx**: Visual component for tracking the status of a redemption request.
- **DashboardHeader.tsx**: Header component for the redemption dashboard with status information.

### Sub-directories
- **notifications/**: Components related to redemption notifications.
- **wallet/**: Wallet-specific components for redemption processes.
- **dashboard/**: Dashboard components for redemption management.
- **operations/**: Components for redemption operations and processing.
- **calendar/**: Calendar-related components for redemption scheduling.

## Usage
These components are used in the redemption sections of the application, allowing users to request token redemptions, track status, and approvers to review and process redemption requests.

## Dependencies
- React
- UI component library
- Multi-signature workflow libraries
- Transaction processing services
- Notification systems