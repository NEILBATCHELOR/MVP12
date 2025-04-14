import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ActivityMetricsProps {
  projectId?: string;
}

const ActivityMetrics: React.FC<ActivityMetricsProps> = ({ projectId }) => {
  const [metrics, setMetrics] = useState({
    investors: 0,
    subscriptions: 0,
    allocations: 0,
    distributions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching activity metrics for project ID:", projectId);

        if (!projectId) {
          setIsLoading(false);
          return;
        }

        // 1. Get cap table ID for this project
        const { data: capTableData } = await supabase
          .from("cap_tables")
          .select("id")
          .eq("project_id", projectId)
          .single();

        // 2. Get investor count from cap_table_investors
        let investorCount = 0;
        if (capTableData?.id) {
          const { data: investorData } = await supabase
            .from("cap_table_investors")
            .select("investor_id")
            .eq("cap_table_id", capTableData.id);

          investorCount = investorData?.length || 0;
          console.log(
            `Found ${investorCount} investors for project ${projectId}`,
          );
        }

        // 3. Get subscription count
        const { data: subscriptionData } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("project_id", projectId);

        const subscriptionCount = subscriptionData?.length || 0;
        console.log(
          `Found ${subscriptionCount} subscriptions for project ${projectId}`,
        );

        // Get subscription IDs for token allocation queries
        const subscriptionIds = subscriptionData?.map((sub) => sub.id) || [];

        // 4. Get allocations count (token_allocations where distributed = false)
        let allocationsCount = 0;
        if (subscriptionIds.length > 0) {
          const { data: allocData } = await supabase
            .from("token_allocations")
            .select("id")
            .in("subscription_id", subscriptionIds)
            .eq("distributed", false);

          allocationsCount = allocData?.length || 0;
          console.log(
            `Found ${allocationsCount} allocations (not distributed) for project ${projectId}`,
          );
        }

        // 5. Get distributions count (token_allocations where distributed = true)
        let distributionsCount = 0;
        if (subscriptionIds.length > 0) {
          const { data: distData } = await supabase
            .from("token_allocations")
            .select("id")
            .in("subscription_id", subscriptionIds)
            .eq("distributed", true);

          distributionsCount = distData?.length || 0;
          console.log(
            `Found ${distributionsCount} distributions (distributed = true) for project ${projectId}`,
          );
        }

        setMetrics({
          investors: investorCount,
          subscriptions: subscriptionCount,
          allocations: allocationsCount,
          distributions: distributionsCount,
        });
      } catch (error) {
        console.error("Error fetching activity metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Investors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{metrics.investors}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total investor record count
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{metrics.subscriptions}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total subscriptions for project
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Allocations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{metrics.allocations}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Token allocations not yet distributed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Distributions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{metrics.distributions}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Token allocations that have been distributed
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityMetrics;
