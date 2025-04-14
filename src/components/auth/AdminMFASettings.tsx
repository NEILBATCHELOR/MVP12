import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthProvider";
import { UserRole } from "@/types/centralModels";
// Activity logging disabled

interface MFAPolicy {
  id?: string;
  name: string;
  description: string;
  required: boolean;
  applies_to: string[];
  exceptions: string[];
  created_at?: string;
  updated_at?: string;
}

const AdminMFASettings: React.FC = () => {
  const { user } = useAuth();
  const [globalMFARequired, setGlobalMFARequired] = useState<boolean>(false);
  const [policies, setPolicies] = useState<MFAPolicy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      loadMFASettings();
    }
  }, [user]);

  const loadMFASettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load global MFA setting
      const { data: globalSetting, error: globalError } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "mfa_required")
        .single();

      if (globalError && globalError.code !== "PGRST116") throw globalError;

      setGlobalMFARequired(globalSetting?.value === "true");

      // Load MFA policies
      const { data: policiesData, error: policiesError } = await supabase
        .from("mfa_policies")
        .select("*")
        .order("created_at", { ascending: false });

      if (policiesError) throw policiesError;

      // Create typed policies from the database result
      const transformedPolicies = (policiesData || []).map((policy: any): MFAPolicy => {
        return {
          id: policy.id,
          name: policy.name || '',
          description: policy.description || '',
          required: Boolean(policy.required),
          applies_to: Array.isArray(policy.applies_to) ? policy.applies_to : [],
          exceptions: Array.isArray(policy.exceptions) ? policy.exceptions : [],
          created_at: policy.created_at,
          updated_at: policy.updated_at || policy.created_at
        };
      });

      setPolicies(transformedPolicies);
    } catch (err: any) {
      console.error("Error loading MFA settings:", err);
      setError("Failed to load MFA settings");
    } finally {
      setLoading(false);
    }
  };

  const updateGlobalMFASetting = async (required: boolean) => {
    try {
      setLoading(true);
      setError(null);

      // Update the global MFA setting
      const { error } = await supabase
        .from("system_settings")
        .upsert({
          key: "mfa_required",
          value: required.toString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      // Activity logging disabled
      console.log("MFA policy updated", {
        userId: user?.id,
        email: user?.email,
        globalMfaRequired: required,
      });

      setGlobalMFARequired(required);
    } catch (err: any) {
      console.error("Error updating global MFA setting:", err);
      setError("Failed to update global MFA setting");

      // Activity logging disabled
      console.log("MFA policy update failed", {
        userId: user?.id,
        email: user?.email,
        globalMfaRequired: required,
        error: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if a user is exempt from MFA
  const isUserExempt = (userId: string): boolean => {
    // Check all policies for exceptions
    for (const policy of policies) {
      if (policy.required && policy.exceptions.includes(userId)) {
        return true;
      }
    }
    return false;
  };

  // Check if MFA is required for a user
  const isMFARequiredForUser = (userId: string, userRole: string): boolean => {
    // If global MFA is not required, check policies
    if (!globalMFARequired) {
      for (const policy of policies) {
        if (
          policy.required &&
          (policy.applies_to.includes(userRole) ||
            policy.applies_to.includes(userId)) &&
          !policy.exceptions.includes(userId)
        ) {
          return true;
        }
      }
      return false;
    }

    // If global MFA is required, check for exceptions
    return !isUserExempt(userId);
  };

  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          You don't have permission to access MFA settings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Multi-Factor Authentication Settings</CardTitle>
          <CardDescription>
            Configure organization-wide MFA policies and exceptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="space-y-1">
                <Label
                  htmlFor="global-mfa-toggle"
                  className="text-base font-medium"
                >
                  Require MFA for All Users
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, all users will be required to set up two-factor
                  authentication unless specifically exempted.
                </p>
              </div>
              <Switch
                id="global-mfa-toggle"
                checked={globalMFARequired}
                onCheckedChange={updateGlobalMFASetting}
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="pt-4">
              <h3 className="text-lg font-medium mb-2">MFA Policies</h3>
              {policies.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applies To</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className="font-medium">
                          {policy.name}
                        </TableCell>
                        <TableCell>{policy.description}</TableCell>
                        <TableCell>
                          {policy.required ? (
                            <span className="text-green-600 font-medium">
                              Required
                            </span>
                          ) : (
                            <span className="text-gray-500">Not Required</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {policy.applies_to.length > 0
                            ? policy.applies_to.join(", ")
                            : "All Users"}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No MFA policies defined yet.
                </div>
              )}
              <div className="mt-4">
                <Button variant="outline">Add New Policy</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User MFA Status</CardTitle>
          <CardDescription>
            View and manage individual user MFA settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              User MFA status management is available in the User Management
              section.
            </p>
            <Button
              className="mt-2"
              onClick={() => (window.location.href = "/role-management")}
            >
              Go to User Management
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMFASettings;
