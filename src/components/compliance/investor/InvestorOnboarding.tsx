import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RegistrationForm } from './components/RegistrationForm';
import { InvestorProfile } from './components/InvestorProfile';
import { KYCVerification } from './components/KYCVerification';
import { WalletSetup } from './components/WalletSetup';
import { OnboardingDashboard } from './components/OnboardingDashboard';
import { OnboardingProvider } from './context/OnboardingContext';

const InvestorOnboarding: React.FC = () => {
  return (
    <OnboardingProvider>
      <Routes>
        <Route path="/" element={<Navigate to="registration" replace />} />
        <Route path="/registration" element={<RegistrationForm />} />
        <Route path="/profile" element={<InvestorProfile />} />
        <Route path="/kyc" element={<KYCVerification />} />
        <Route path="/wallet-setup" element={<WalletSetup />} />
        <Route path="/dashboard" element={<OnboardingDashboard />} />
      </Routes>
    </OnboardingProvider>
  );
};

export default InvestorOnboarding;