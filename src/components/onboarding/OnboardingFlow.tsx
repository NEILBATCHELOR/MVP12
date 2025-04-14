import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RegistrationForm from "./RegistrationForm";
import VerificationSetup from "./VerificationSetup";
import OrganizationDetails from "./OrganizationDetails";
import ComplianceDueDiligence from "./ComplianceDueDiligence";
import WalletSetup from "./WalletSetup";
import FinalReview from "./FinalReview";

const OnboardingFlow = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/onboarding/registration" />} />
      <Route path="/registration" element={<RegistrationForm />} />
      <Route path="/verification" element={<VerificationSetup />} />
      <Route path="/organization" element={<OrganizationDetails />} />
      <Route path="/compliance" element={<ComplianceDueDiligence />} />
      <Route path="/wallet-setup" element={<WalletSetup />} />
      <Route path="/review" element={<FinalReview />} />
    </Routes>
  );
};

export default OnboardingFlow;
