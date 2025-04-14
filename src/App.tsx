import React, { Suspense, useEffect, lazy } from "react";
import { Roles } from '@/constants/roles';
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import CapTableDashboard from "./components/captable/CapTableDashboard";
import InvestorsList from "./components/investors/InvestorsList";
import ReportsDashboard from "./components/reports/ReportsDashboard";
import TokenBuilder from "./components/tokens/TokenBuilder";
import TokenAdministration from "./components/tokens/TokenAdministration";
// Token Management Page Wrappers
import { default as TokensListPage } from "./pages/token/TokenManagementPage";
import TokenDetailPage from "./pages/token/TokenDetailPage";
import TokenFormPage from "./pages/token/TokenFormPage";
import TokenTemplateListPage from "./pages/token/TokenTemplateListPage";
import TokenTemplateFormPage from "./pages/token/TokenTemplateFormPage";
import MainLayout from "./components/layout/MainLayout";
import CapTableManagerNew from "./components/captable/CapTableManagerNew";
import RuleManagementDashboard from "./components/rules/RuleManagementDashboard";
import PolicyTemplateDashboard from "./components/rules/PolicyTemplateDashboard";
import PolicyTemplateVersionManagement from "./components/rules/PolicyTemplateVersionManagement";
import RoleManagementDashboard from "./components/UserManagement/dashboard/RoleManagementDashboard";
import RedemptionDashboard from "./components/redemption/RedemptionDashboard";
import ActivityMonitorPage from "./pages/ActivityMonitorPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import MFASettingsPage from "./pages/MFASettingsPage";
import UserMFAPage from "./pages/UserMFAPage";
import EnhancedApprovalDashboard from "./components/rules/EnhancedApprovalDashboard";

// Wallet Pages
import NewWalletPage from "./components/wallet/NewWalletPage";
import WalletDashboardPage from "./components/wallet/WalletDashboardPage";
import TransferPage from "./components/wallet/TransferPage";
import SwapPage from "./components/wallet/SwapPage";

// ✅ Import Onboarding Components
import WelcomeScreen from "@/components/onboarding/WelcomeScreen";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import OnboardingHome from "@/components/onboarding/OnboardingHome"; // Ensure this exists!
// Import provider
import { OnboardingProvider } from "@/components/onboarding/OnboardingContext";
import InvestorOnboardingFlow from "@/components/investors/InvestorOnboardingFlow";
import InvestorOnboarding from "@/components/compliance/investor/InvestorOnboarding";

// Import Compliance Components
import IssuerOnboarding from "@/components/compliance/operations/issuer/IssuerOnboarding";
import KYCAMLChecks from "@/components/compliance/operations/kyc/KYCAMLChecks";
import DocumentManagement from "@/components/compliance/operations/documents/DocumentManagement";
import RiskAssessment from "@/components/compliance/operations/risk/RiskAssessment";
import { ComplianceMonitoring } from "@/components/compliance/operations/shared/monitoring/ComplianceMonitoring";
import { ComplianceReporting } from "@/components/compliance/operations/shared/reporting/ComplianceReporting";
import { AuditTrail } from "@/components/compliance/operations/shared/audit/AuditTrail";
import RestrictionManager from "@/components/compliance/operations/restrictions/RestrictionManager";
import { WalletOperationsPage } from "@/components/compliance/operations/investor/pages";
import { ComplianceDashboard } from "@/components/compliance/operations";

// Import Auth Components
import UnauthorizedPage from "@/components/auth/UnauthorizedPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Import Notification Provider
import { NotificationProvider } from "@/context/NotificationContext";

// Add this import
const IssuerOnboardingFlow = lazy(() => import('./components/compliance/issuer/onboarding/IssuerOnboardingFlow'));

/**
 * Main App component with routing configuration
 */
function App() {
  useEffect(() => {
    // Initialize any required app state
  }, []);

  return (
    <>
      <NotificationProvider>
        <OnboardingProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {/* Default route redirects to welcome screen */}
              <Route path="/" element={<WelcomeScreen />} />
              <Route index element={<WelcomeScreen />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Onboarding Routes */}
              <Route path="/onboarding/*" element={<OnboardingFlow />} />
              <Route path="/onboarding/home" element={<OnboardingHome />} />

              {/* Investor onboarding */}
              <Route path="/investor/*" element={<InvestorOnboardingFlow />} />

              {/* Main Layout - Ensures Sidebar Renders Only Once */}
              <Route element={<MainLayout />}>
                <Route path="dashboard" element={<CapTableDashboard />} />
                <Route path="projects" element={<Home />} />
                <Route path="activity" element={<ActivityMonitorPage />} />

                {/* Wallet Routes */}
                <Route path="wallet/new" element={<NewWalletPage />} />
                <Route path="wallet/dashboard" element={<WalletDashboardPage />} />
                <Route path="wallet/transfer" element={<TransferPage />} />
                <Route path="wallet/swap" element={<SwapPage />} />

                {/* Cap Table Routes */}
                <Route path="captable" element={<CapTableManagerNew section="overview" />} />
                <Route path="captable/investors" element={<CapTableManagerNew section="investors" />} />
                <Route path="captable/subscriptions" element={<CapTableManagerNew section="subscriptions" />} />
                <Route path="captable/allocations" element={<CapTableManagerNew section="allocations" />} />
                <Route path="captable/distributions" element={<CapTableManagerNew section="distributions" />} />
                <Route path="captable/compliance" element={<CapTableManagerNew section="compliance" />} />
                <Route path="captable/reports" element={<CapTableManagerNew section="reports" />} />
                <Route path="captable/documents" element={<CapTableManagerNew section="documents" />} />
                <Route path="captable/minting" element={<CapTableManagerNew section="minting" />} />

                {/* Project-specific Cap Table Routes */}
                <Route path="/projects/:projectId/captable" element={<CapTableManagerNew />} />
                <Route path="/projects/:projectId/captable/investors" element={<CapTableManagerNew section="investors" />} />
                <Route path="/projects/:projectId/captable/subscriptions" element={<CapTableManagerNew section="subscriptions" />} />
                <Route path="/projects/:projectId/captable/allocations" element={<CapTableManagerNew section="allocations" />} />
                <Route path="/projects/:projectId/captable/distributions" element={<CapTableManagerNew section="distributions" />} />
                <Route path="/projects/:projectId/captable/minting" element={<CapTableManagerNew section="minting" />} />

                {/* Management and Reporting Routes */}
                <Route path="rule-management" element={<RuleManagementDashboard />} />
                <Route path="role-management" element={<RoleManagementDashboard />} />
                <Route path="mfa-settings" element={<MFASettingsPage />} />
                <Route path="account/security" element={<UserMFAPage />} />
                <Route path="redemption" element={<RedemptionDashboard />} />
                <Route path="investors" element={<InvestorsList />} />
                <Route path="reports" element={<ReportsDashboard />} />
                <Route path="/projects/:projectId/tokens" element={<TokenBuilder />} />
                <Route path="/projects/:projectId/token-admin" element={<TokenAdministration />} />
                
                {/* Add the Approvals route */}
                <Route path="approvals" element={<EnhancedApprovalDashboard />}/>

                {/* Token Management Routes */}
                <Route path="/projects/:projectId/token-management" element={<TokensListPage />} />
                <Route path="/projects/:projectId/token-management/:tokenId" element={<TokenDetailPage />} />
                <Route path="/projects/:projectId/token-management/new" element={<TokenFormPage />} />
                <Route path="/projects/:projectId/token-management/:tokenId/edit" element={<TokenFormPage />} />
                
                {/* Token Template Routes */}
                <Route path="/projects/:projectId/token-templates" element={<TokenTemplateListPage />} />
                <Route path="/projects/:projectId/token-templates/new" element={<TokenTemplateFormPage />} />
                <Route path="/projects/:projectId/token-templates/:templateId/edit" element={<TokenTemplateFormPage />} />
                
                {/* Policy Template Routes */}
                <Route path="templates" element={<PolicyTemplateDashboard />} />
                <Route path="templates/:templateId" element={<PolicyTemplateVersionManagement />} />
                <Route path="templates/:templateId/versions" element={<PolicyTemplateVersionManagement />} />
                
                {/* Compliance Routes - Moved inside MainLayout */}
                <Route path="compliance/investor-onboarding/*" element={<InvestorOnboarding />} />
                <Route path="compliance/issuer-onboarding" element={<IssuerOnboarding />} />
                <Route path="compliance/operations/dashboard" element={<ComplianceDashboard />} />
                <Route path="compliance/kyc-aml" element={<KYCAMLChecks />} />
                <Route path="compliance/documents" element={<DocumentManagement />} />
                <Route path="compliance/risk" element={<RiskAssessment />} />
                <Route path="compliance/monitoring" element={<ComplianceMonitoring onAlertStatusChange={async (alertId, status) => {
                  console.log(`Alert ${alertId} status changed to ${status}`);
                  // TODO: Implement alert status change handler
                }} onError={(error) => {
                  console.error('Monitoring error:', error);
                  // TODO: Implement error handling
                }} />} />
                <Route path="compliance/audit" element={<AuditTrail onError={(error) => {
                  console.error('Audit trail error:', error);
                  // TODO: Implement error handling
                }} />} />
                <Route path="compliance/reports" element={<ComplianceReporting 
                  onGenerateReport={async (type, startDate, endDate) => {
                    console.log(`Generating ${type} report from ${startDate} to ${endDate}`);
                    // TODO: Implement report generation
                  }}
                  onDownloadReport={async (reportId) => {
                    console.log(`Downloading report ${reportId}`);
                    // TODO: Implement report download
                  }}
                  onError={(error) => {
                    console.error('Reporting error:', error);
                    // TODO: Implement error handling
                  }}
                />} />
                <Route path="compliance/rules" element={<RuleManagementDashboard />} />
                <Route path="compliance/restrictions" element={<RestrictionManager />} />
                <Route path="compliance/operations/investor/wallets" element={<WalletOperationsPage />} />
                
                {/* Issuer Onboarding */}
                <Route path="compliance/issuer/onboarding/*" element={<IssuerOnboardingFlow />} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={
                <div style={{padding: "2rem", textAlign: "center"}}>
                  <h1>Page Not Found</h1>
                  <p>The route {window.location.pathname} doesn't exist.</p>
                  <div style={{marginTop: "2rem"}}>
                    <a href="/" style={{color: "blue", textDecoration: "underline"}}>Go Home</a>
                  </div>
                </div>
              } />
            </Routes>
          </Suspense>
        </OnboardingProvider>
      </NotificationProvider>
    </>
  );
}

export default App;
