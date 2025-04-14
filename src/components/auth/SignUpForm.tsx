import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Completely disabled SignUpForm
interface SignUpFormProps {
  userType: "issuer" | "investor";
  onSuccess?: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ userType, onSuccess }) => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    // Auto-login with admin bypass
    localStorage.setItem("adminBypass", "true");

    if (onSuccess) {
      onSuccess();
    } else {
      // Redirect based on user type
      if (userType === "issuer") {
        navigate("/onboarding/verification");
      } else {
        navigate("/investor/verification");
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Disabled</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <p className="mb-4">
            User registration has been disabled. Click below to continue as
            admin.
          </p>
          <Button onClick={handleSignUp} className="w-full mb-4">
            Continue as Admin
          </Button>
          <div className="text-sm">
            <Button
              variant="link"
              className="p-0"
              onClick={() => navigate("/")}
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
