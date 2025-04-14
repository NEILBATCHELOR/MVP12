import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Completely disabled MFAVerification
interface MFAVerificationProps {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const MFAVerification: React.FC<MFAVerificationProps> = ({
  onSuccess,
  onCancel,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>MFA Verification Disabled</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <p className="mb-4">Multi-factor authentication has been disabled.</p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={onCancel}>
              Back
            </Button>
            <Button onClick={onSuccess}>Continue</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MFAVerification;
