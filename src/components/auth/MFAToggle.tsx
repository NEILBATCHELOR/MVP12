import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Completely disabled MFAToggle
interface MFAToggleProps {
  userId?: string;
  isAdmin?: boolean;
}

const MFAToggle: React.FC<MFAToggleProps> = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <p>
            Multi-factor authentication has been disabled in this application.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MFAToggle;
