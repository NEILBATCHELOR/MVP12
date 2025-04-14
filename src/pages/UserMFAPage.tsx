import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import MFASetup from "@/components/auth/MFASetup";
import MFAToggle from "@/components/auth/MFAToggle";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthProvider";

interface UserMFAPageProps {
  children?: React.ReactNode;
}

const UserMFAPage: React.FC<UserMFAPageProps> = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Account Security</h1>

      <Tabs defaultValue="mfa" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="mfa">Two-Factor Authentication</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="mfa" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account by enabling
                two-factor authentication.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MFAToggle />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Set Up Two-Factor Authentication</CardTitle>
              <CardDescription>
                Use an authenticator app to generate verification codes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MFASetup />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Password management is available in the account settings
                section.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserMFAPage;
