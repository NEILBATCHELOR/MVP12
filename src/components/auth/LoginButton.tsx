import React, { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import LoginModal from "./LoginModal";

interface LoginButtonProps extends ButtonProps {
  userType?: "issuer" | "investor";
  label?: string;
}

const LoginButton = ({
  userType = "issuer",
  label = "Sign In",
  ...props
}: LoginButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} {...props}>
        {label}
      </Button>

      <LoginModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        defaultTab={userType}
      />
    </>
  );
};

export default LoginButton;
