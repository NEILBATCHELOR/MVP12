import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase, debugQuery } from "@/lib/supabase";
import type { Database } from "@/types/database";

export default function DatabaseDebugStoryboard() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState("");

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      // This query lists all tables in the public schema
      const { data, error } = await supabase.rpc("list_tables");

      if (error) {
        console.error("Error fetching tables:", error);
        setError(`Failed to fetch tables: ${error.message}`);

        // Fallback to a hardcoded list of known tables
        setTables([
          "projects",
          "investors",
          "cap_table_investors",
          "subscriptions",
          "token_allocations",
          "allocations",
          "users",
          "audit_logs",
        ]);
      } else if (data) {
        // Convert the data array of objects to an array of strings
        setTables(data.map((table: { table_name: string }) => table.table_name));
      }
    } catch (err) {
      console.error("Exception fetching tables:", err);
      setError(
        `Exception fetching tables: ${err instanceof Error ? err.message : String(err)}`,
      );

      // Fallback to a hardcoded list of known tables
      setTables([
        "projects",
        "investors",
        "cap_table_investors",
        "subscriptions",
        "token_allocations",
        "allocations",
        "users",
        "audit_logs",
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableInfo = async (tableName: string) => {
    setLoading(true);
    setError(null);
    setSelectedTable(tableName);

    try {
      // First try to get a sample row to determine columns
      const { data, error } = await supabase
        .from(tableName as any)
        .select("*")
        .limit(1);

      if (error) {
        console.error(`Error fetching sample from ${tableName}:`, error);
        setError(`Failed to fetch sample from ${tableName}: ${error.message}`);
        setTableColumns([]);
        setTableData([]);
      } else if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        setTableColumns(columns);

        // Now fetch actual data
        const result = await debugQuery(
          tableName, 
          projectId || null, 
          {
            detailed: true,
          }
        );
        if (result.success && result.data) {
          setTableData(result.data);
        } else {
          setError(
            `Failed to fetch data from ${tableName}: ${result.error ? JSON.stringify(result.error) : "Unknown error"}`,
          );
          setTableData([]);
        }
      } else {
        setTableColumns([]);
        setTableData([]);
        setError(`No data found in ${tableName}`);
      }
    } catch (err) {
      console.error(`Exception fetching data from ${tableName}:`, err);
      setError(
        `Exception fetching data from ${tableName}: ${err instanceof Error ? err.message : String(err)}`,
      );
      setTableColumns([]);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Database Debug Tool</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tables</CardTitle>
            <CardDescription>Select a table to inspect</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="projectId">Project ID (optional)</Label>
              <Input
                id="projectId"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="Enter project ID for filtering"
                className="mb-2"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to query without project filter
              </p>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {tables.map((table) => (
                <Button
                  key={table}
                  variant={selectedTable === table ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => fetchTableInfo(table)}
                >
                  {table}
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={fetchTables}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? "Loading..." : "Refresh Tables"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>{selectedTable || "No Table Selected"}</CardTitle>
            <CardDescription>
              {tableColumns.length > 0
                ? `${tableColumns.length} columns, ${tableData.length} rows`
                : "Select a table to view its structure and data"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
                {error}
              </div>
            )}

            {selectedTable && (
              <Tabs defaultValue="columns">
                <TabsList className="mb-4">
                  <TabsTrigger value="columns">Columns</TabsTrigger>
                  <TabsTrigger value="data">Data</TabsTrigger>
                </TabsList>

                <TabsContent value="columns">
                  {tableColumns.length > 0 ? (
                    <div className="space-y-2">
                      {tableColumns.map((column) => (
                        <div key={column} className="p-2 bg-muted rounded-md">
                          {column}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No columns found or table is empty</p>
                  )}
                </TabsContent>

                <TabsContent value="data">
                  {tableData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            {tableColumns.map((column) => (
                              <th
                                key={column}
                                className="border p-2 text-left bg-muted"
                              >
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.slice(0, 10).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {tableColumns.map((column) => (
                                <td
                                  key={`${rowIndex}-${column}`}
                                  className="border p-2"
                                >
                                  {typeof row[column] === "object"
                                    ? JSON.stringify(row[column])
                                    : String(row[column] ?? "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {tableData.length > 10 && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Showing 10 of {tableData.length} rows
                        </p>
                      )}
                    </div>
                  ) : (
                    <p>No data found</p>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
