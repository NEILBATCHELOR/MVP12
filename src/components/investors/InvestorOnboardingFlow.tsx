import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import InvestorRegistration from "./InvestorRegistration";
import InvestorVerification from "./InvestorVerification";
import InvestorProfile from "./InvestorProfile";
import InvestorKYC from "./InvestorKYC";
import InvestorWalletSetup from "./InvestorWalletSetup";
import InvestorDashboard from "./InvestorDashboard";
import InvestorApprovalPending from "./InvestorApprovalPending";

const InvestorOnboardingFlow = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/investor/registration" />} />
      <Route path="/registration" element={<InvestorRegistration />} />
      <Route path="/verification" element={<InvestorVerification />} />
      <Route path="/profile" element={<InvestorProfile />} />
      <Route path="/kyc" element={<InvestorKYC />} />
      <Route path="/wallet-setup" element={<InvestorWalletSetup />} />
      <Route path="/dashboard" element={<InvestorDashboard />} />
      <Route path="/approval" element={<InvestorApprovalPending />} />
    </Routes>
  );
};

export default InvestorOnboardingFlow;
