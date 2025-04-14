import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Completely disabled LoginModal
interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "issuer" | "investor";
}

const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Auto-login with admin bypass
    localStorage.setItem("adminBypass", "true");
    navigate("/dashboard");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Auth Disabled</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <p className="text-center mb-4">
            Authentication has been disabled. Click below to continue as admin.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleLogin} className="w-full">
            Continue as Admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
