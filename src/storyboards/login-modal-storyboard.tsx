import React, { useState } from "react";
import LoginModal from "@/components/auth/LoginModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginModalStoryboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"issuer" | "investor">("issuer");

  return (
    <div className="p-8 max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Login Modal Demo</h1>
        <p className="text-gray-600 mb-6">
          Click the buttons below to open the login modal with different default
          tabs.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "issuer" | "investor")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="issuer">Issuer</TabsTrigger>
          <TabsTrigger value="investor">Investor</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex justify-center">
        <Button onClick={() => setIsOpen(true)}>
          Open {activeTab === "issuer" ? "Issuer" : "Investor"} Login Modal
        </Button>
      </div>

      <LoginModal
        open={isOpen}
        onOpenChange={setIsOpen}
        defaultTab={activeTab}
      />
    </div>
  );
}
