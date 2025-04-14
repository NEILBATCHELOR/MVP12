import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Completely disabled MFASetup
interface MFASetupProps {
  onComplete?: () => void;
}

const MFASetup: React.FC<MFASetupProps> = ({ onComplete }) => {
  const handleComplete = () => {
    if (onComplete) onComplete();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>MFA Setup Disabled</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <p className="mb-4">Multi-factor authentication has been disabled.</p>
          <Button onClick={handleComplete}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MFASetup;
