import React from "react";
import AdminMFASettings from "@/components/auth/AdminMFASettings";
import { useAuth } from "@/contexts/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserRole } from "@/types/centralModels";

const MFASettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        Multi-Factor Authentication Settings
      </h1>

      {user?.role === UserRole.ADMIN ? (
        <AdminMFASettings />
      ) : (
        <Alert variant="destructive">
          <AlertDescription>
            You don't have permission to access MFA settings. Please contact an
            administrator.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MFASettingsPage;
