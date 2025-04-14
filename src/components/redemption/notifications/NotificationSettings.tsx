import React from "react";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, BellOff, Mail, AlertTriangle } from "lucide-react";

interface NotificationSettingsProps {
  emailNotifications: boolean;
  onEmailNotificationsChange: (enabled: boolean) => void;
  pushNotifications: boolean;
  onPushNotificationsChange: (enabled: boolean) => void;
  statusChangeNotifications: boolean;
  onStatusChangeNotificationsChange: (enabled: boolean) => void;
  approvalNotifications: boolean;
  onApprovalNotificationsChange: (enabled: boolean) => void;
  transactionNotifications: boolean;
  onTransactionNotificationsChange: (enabled: boolean) => void;
}

const NotificationSettings = ({
  emailNotifications = true,
  onEmailNotificationsChange,
  pushNotifications = true,
  onPushNotificationsChange,
  statusChangeNotifications = true,
  onStatusChangeNotificationsChange,
  approvalNotifications = true,
  onApprovalNotificationsChange,
  transactionNotifications = true,
  onTransactionNotificationsChange,
}: NotificationSettingsProps) => {
  const { permission, requestPermission } = useNotificationPermission();

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === "granted") {
      onPushNotificationsChange(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how you want to receive updates about your redemption
          requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Delivery Methods</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="email-notifications" className="flex-1">
                Email Notifications
              </Label>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={onEmailNotificationsChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="push-notifications" className="flex-1">
                Push Notifications
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              {permission === "denied" && (
                <span className="text-xs text-destructive flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Blocked
                </span>
              )}
              {permission === "unsupported" ? (
                <span className="text-xs text-muted-foreground">
                  Not supported
                </span>
              ) : permission === "default" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestPermission}
                  className="h-7 text-xs"
                >
                  Enable
                </Button>
              ) : (
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={onPushNotificationsChange}
                  disabled={permission !== "granted"}
                />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Types</h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="status-change-notifications" className="flex-1">
              Status Changes
            </Label>
            <Switch
              id="status-change-notifications"
              checked={statusChangeNotifications}
              onCheckedChange={onStatusChangeNotificationsChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="approval-notifications" className="flex-1">
              Approval Updates
            </Label>
            <Switch
              id="approval-notifications"
              checked={approvalNotifications}
              onCheckedChange={onApprovalNotificationsChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="transaction-notifications" className="flex-1">
              Transaction Confirmations
            </Label>
            <Switch
              id="transaction-notifications"
              checked={transactionNotifications}
              onCheckedChange={onTransactionNotificationsChange}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationSettings;
