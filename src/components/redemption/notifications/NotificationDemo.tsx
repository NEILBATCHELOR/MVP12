import React from "react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/NotificationContext";

const NotificationDemo = () => {
  const { addNotification } = useNotifications();

  const sendStatusChangeNotification = () => {
    addNotification({
      title: "Redemption Status Updated",
      description: "Your redemption request #RDM-12345 has been approved.",
    });
  };

  const sendApprovalNotification = () => {
    addNotification({
      title: "New Approval",
      description: "Fund Manager has approved your redemption request.",
    });
  };

  const sendTransactionNotification = () => {
    addNotification({
      title: "Transaction Confirmed",
      description:
        "Your redemption transaction has been confirmed on the blockchain.",
    });
  };

  const sendRejectionNotification = () => {
    addNotification({
      title: "Redemption Rejected",
      description:
        "Your redemption request #RDM-12345 has been rejected due to insufficient funds.",
    });
  };

  const sendReminderNotification = () => {
    addNotification({
      title: "Upcoming Redemption Window",
      description:
        "A new redemption window opens in 3 days. Prepare your requests now.",
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Test Notifications</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        <Button
          onClick={sendStatusChangeNotification}
          variant="outline"
          size="sm"
        >
          Status Change
        </Button>
        <Button onClick={sendApprovalNotification} variant="outline" size="sm">
          New Approval
        </Button>
        <Button
          onClick={sendTransactionNotification}
          variant="outline"
          size="sm"
        >
          Transaction Confirmed
        </Button>
        <Button onClick={sendRejectionNotification} variant="outline" size="sm">
          Rejection
        </Button>
        <Button onClick={sendReminderNotification} variant="outline" size="sm">
          Redemption Window Reminder
        </Button>
      </div>
    </div>
  );
};

export default NotificationDemo;
