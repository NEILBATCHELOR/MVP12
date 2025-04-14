import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Plus, Edit, Trash } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../ui/table";
import { Badge } from "../ui/badge";
import { supabase } from "@/lib/supabase";
import RuleEditModal from "./RuleEditModal";

const RuleEditExample = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("rules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setRules(data || []);
    } catch (error) {
      console.error("Error fetching rules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRule = () => {
    setSelectedRuleId(undefined);
    setOpenModal(true);
  };

  const handleEditRule = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setOpenModal(true);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("rules")
        .delete()
        .eq("rule_id", ruleId);

      if (error) {
        throw error;
      }

      // Refresh the rules list
      fetchRules();
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rule Management</h1>
        <Button
          onClick={handleCreateRule}
          className="bg-[#0f172b] hover:bg-[#0f172b]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Rule
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading rules...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No rules found. Create your first rule.
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => (
                  <TableRow key={rule.rule_id}>
                    <TableCell className="font-medium">{rule.rule_name}</TableCell>
                    <TableCell>
                      {rule.rule_type.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={rule.status === "active" ? "default" : "secondary"}
                        className={
                          rule.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {rule.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rule.is_template ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          Template
                        </Badge>
                      ) : (
                        "No"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(rule.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRule(rule.rule_id)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.rule_id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <RuleEditModal
        open={openModal}
        onOpenChange={setOpenModal}
        ruleId={selectedRuleId}
        onSuccess={fetchRules}
      />
    </div>
  );
};

export default RuleEditExample; 