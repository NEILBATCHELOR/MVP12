import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import IssuerOnboardingLayout from "./IssuerOnboardingLayout";

// Lazily load components to improve performance
const RegistrationForm = React.lazy(() => import("./RegistrationForm"));
const OrganizationDetails = React.lazy(() => import("./OrganizationDetails"));
const WalletSetup = React.lazy(() => import("./WalletSetup"));
const FinalReview = React.lazy(() => import("./FinalReview"));

const IssuerOnboardingFlow = () => {
  return (
    <IssuerOnboardingLayout>
      <React.Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/compliance/issuer/onboarding/registration" />} />
          <Route path="/registration" element={<RegistrationForm />} />
          <Route path="/organization-details" element={<OrganizationDetails />} />
          <Route path="/wallet-setup" element={<WalletSetup />} />
          <Route path="/review" element={<FinalReview />} />
        </Routes>
      </React.Suspense>
    </IssuerOnboardingLayout>
  );
};

export default IssuerOnboardingFlow;