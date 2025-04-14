import React from "react";
import { useNavigate } from "react-router-dom";
import WelcomeScreen from "@/components/onboarding/WelcomeScreen";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";

export default function AdminBypassStoryboard() {
  const navigate = useNavigate();

  const handleTokenBuilderClick = () => {
    // Set admin bypass in localStorage before navigating
    localStorage.setItem("adminBypass", "true");
    navigate("/token-builder");
  };

  return (
    <div className="w-full h-full">
      <WelcomeScreen />
      <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-md text-sm">
        <p>
          <strong>Admin Bypass Instructions:</strong>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Click the settings icon in the top-right corner</li>
          <li>
            Enter password: <code>admin123</code>
          </li>
          <li>
            Or use keyboard shortcut: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+
            <kbd>A</kbd>
          </li>
        </ul>
      </div>
    </div>
  );
}
