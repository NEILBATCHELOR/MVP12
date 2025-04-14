import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  statusUpdates: z.boolean().default(true),
  approvalUpdates: z.boolean().default(true),
  transactionConfirmations: z.boolean().default(true),
  marketingUpdates: z.boolean().default(false),
  dailyDigest: z.boolean().default(false),
});

type EmailPreferencesFormValues = z.infer<typeof formSchema>;

interface EmailPreferencesProps {
  defaultEmail?: string;
  onSubmit?: (values: EmailPreferencesFormValues) => void;
}

const EmailPreferences = ({
  defaultEmail = "",
  onSubmit = () => {},
}: EmailPreferencesProps) => {
  const form = useForm<EmailPreferencesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: defaultEmail,
      statusUpdates: true,
      approvalUpdates: true,
      transactionConfirmations: true,
      marketingUpdates: false,
      dailyDigest: false,
    },
  });

  function handleSubmit(values: EmailPreferencesFormValues) {
    onSubmit(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notification Preferences</CardTitle>
        <CardDescription>
          Choose which email notifications you'd like to receive about your
          redemption activities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    We'll use this email to send you notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Notification Types</h3>

              <FormField
                control={form.control}
                name="statusUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Redemption Status Updates</FormLabel>
                      <FormDescription>
                        Receive emails when your redemption status changes
                        (pending, approved, processing, completed).
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approvalUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Approval Process Updates</FormLabel>
                      <FormDescription>
                        Receive emails when an approver signs off on your
                        redemption request.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionConfirmations"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Transaction Confirmations</FormLabel>
                      <FormDescription>
                        Receive emails when your redemption transaction is
                        confirmed on the blockchain.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dailyDigest"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Daily Digest</FormLabel>
                      <FormDescription>
                        Receive a daily summary of all your redemption
                        activities instead of individual notifications.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketingUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Marketing Updates</FormLabel>
                      <FormDescription>
                        Receive emails about new features, redemption windows,
                        and other investment opportunities.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="submit">Save Preferences</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EmailPreferences;
