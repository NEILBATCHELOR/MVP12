import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ERC4626NAVPanelProps {
  tokenForm: any;
  setTokenForm: (setter: (prev: any) => any) => void;
}

const ERC4626NAVPanel: React.FC<ERC4626NAVPanelProps> = ({
  tokenForm,
  setTokenForm,
}) => {
  // Default values if not set in tokenForm
  const totalAssets = parseFloat(tokenForm.metadata.totalAssets || "1000");
  const totalShares = parseFloat(tokenForm.metadata.totalShares || "1000");
  const managementFee = parseFloat(tokenForm.metadata.managementFee || "2");
  const performanceFee = parseFloat(tokenForm.metadata.performanceFee || "20");
  const apy = parseFloat(tokenForm.metadata.estimatedApy || "5.2");

  // State for simulation values
  const [simulatedManagementFee, setSimulatedManagementFee] =
    useState(managementFee);
  const [simulatedPerformanceFee, setSimulatedPerformanceFee] =
    useState(performanceFee);
  const [simulatedApy, setSimulatedApy] = useState(apy);
  const [navHistory, setNavHistory] = useState<any[]>([]);

  // Calculate NAV per token
  const calculateNavPerToken = () => {
    if (totalShares === 0) return 1;
    return totalAssets / totalShares;
  };

  // Calculate fee impact
  const calculateFeeImpact = (nav: number) => {
    const totalFeePercentage =
      (simulatedManagementFee + simulatedPerformanceFee) / 100;
    return nav * (1 - totalFeePercentage);
  };

  // Calculate estimated yield
  const calculateEstimatedYield = (nav: number) => {
    return nav * (1 + simulatedApy / 100);
  };

  // Current NAV values
  const currentNav = calculateNavPerToken();
  const navAfterFees = calculateFeeImpact(currentNav);
  const navWithYield = calculateEstimatedYield(currentNav);
  const netAnnualChange = navWithYield - navAfterFees;

  // Generate NAV evolution data for the next 12 months
  useEffect(() => {
    const generateNavHistory = () => {
      const months = 12;
      const data = [];
      let currentNavValue = currentNav;

      for (let i = 0; i <= months; i++) {
        // Monthly fee impact (annual fee divided by 12)
        const monthlyFeeImpact =
          currentNavValue *
          ((simulatedManagementFee + simulatedPerformanceFee) / 100 / 12);

        // Monthly yield (annual yield divided by 12)
        const monthlyYield = currentNavValue * (simulatedApy / 100 / 12);

        // Net monthly change
        const netChange = monthlyYield - monthlyFeeImpact;

        // Add data point
        data.push({
          month: i,
          nav: currentNavValue,
          yield: monthlyYield,
          fees: monthlyFeeImpact,
        });

        // Update NAV for next month
        currentNavValue += netChange;
      }

      return data;
    };

    setNavHistory(generateNavHistory());
  }, [
    currentNav,
    simulatedManagementFee,
    simulatedPerformanceFee,
    simulatedApy,
  ]);

  // Apply simulation values to the actual form
  const applySimulation = () => {
    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        managementFee: simulatedManagementFee.toString(),
        performanceFee: simulatedPerformanceFee.toString(),
        estimatedApy: simulatedApy.toString(),
      },
    }));
  };

  // Reset simulation to current values
  const resetSimulation = () => {
    setSimulatedManagementFee(managementFee);
    setSimulatedPerformanceFee(performanceFee);
    setSimulatedApy(apy);
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-md">NAV Calculations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-4">Current NAV Metrics</h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Total Assets</p>
                  <p className="text-lg font-semibold">
                    {totalAssets.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Shares</p>
                  <p className="text-lg font-semibold">
                    {totalShares.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">NAV per Token</p>
                  <p className="text-lg font-semibold">
                    {currentNav.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Annual Fee Impact</p>
                  <p className="text-lg font-semibold text-red-500">
                    -
                    {(simulatedManagementFee + simulatedPerformanceFee).toFixed(
                      2,
                    )}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estimated APY</p>
                  <p className="text-lg font-semibold text-green-500">
                    +{simulatedApy.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Net Annual Change</p>
                  <p
                    className={`text-lg font-semibold ${netAnnualChange >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {netAnnualChange >= 0 ? "+" : ""}
                    {netAnnualChange.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">NAV Simulation</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="management-fee">Management Fee (%)</Label>
                    <span className="text-sm font-medium">
                      {simulatedManagementFee.toFixed(2)}%
                    </span>
                  </div>
                  <Slider
                    id="management-fee"
                    min={0}
                    max={10}
                    step={0.1}
                    value={[simulatedManagementFee]}
                    onValueChange={(value) =>
                      setSimulatedManagementFee(value[0])
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="performance-fee">Performance Fee (%)</Label>
                    <span className="text-sm font-medium">
                      {simulatedPerformanceFee.toFixed(2)}%
                    </span>
                  </div>
                  <Slider
                    id="performance-fee"
                    min={0}
                    max={30}
                    step={0.5}
                    value={[simulatedPerformanceFee]}
                    onValueChange={(value) =>
                      setSimulatedPerformanceFee(value[0])
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="estimated-apy">Estimated APY (%)</Label>
                    <span className="text-sm font-medium">
                      {simulatedApy.toFixed(2)}%
                    </span>
                  </div>
                  <Slider
                    id="estimated-apy"
                    min={0}
                    max={20}
                    step={0.1}
                    value={[simulatedApy]}
                    onValueChange={(value) => setSimulatedApy(value[0])}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={resetSimulation}>
                  Reset
                </Button>
                <Button onClick={applySimulation}>Apply</Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">NAV Evolution (12 Months)</h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={navHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    label={{
                      value: "Months",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    label={{ value: "NAV", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toFixed(6), "NAV"]}
                    labelFormatter={(label) => `Month ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="nav"
                    name="NAV"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 text-left border">Month</th>
                    <th className="p-2 text-left border">NAV</th>
                    <th className="p-2 text-left border">Monthly Yield</th>
                    <th className="p-2 text-left border">Monthly Fees</th>
                  </tr>
                </thead>
                <tbody>
                  {navHistory.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-2 border">{item.month}</td>
                      <td className="p-2 border">{item.nav.toFixed(6)}</td>
                      <td className="p-2 border text-green-500">
                        +{item.yield.toFixed(6)}
                      </td>
                      <td className="p-2 border text-red-500">
                        -{item.fees.toFixed(6)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">NAV Calculation Formulas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold">Initial NAV per Token</p>
              <p className="font-mono bg-gray-100 p-1 rounded mt-1">
                NAV = Total Assets / Total Shares
              </p>
              <p className="mt-1">
                {totalAssets} / {totalShares} = {currentNav.toFixed(6)}
              </p>
            </div>
            <div>
              <p className="font-semibold">Fee Impact (Annual)</p>
              <p className="font-mono bg-gray-100 p-1 rounded mt-1">
                NAV × (1 - (Mgmt Fee + Perf Fee) / 100)
              </p>
              <p className="mt-1">
                {currentNav.toFixed(6)} × (1 -{" "}
                {(simulatedManagementFee + simulatedPerformanceFee) / 100}) ={" "}
                {navAfterFees.toFixed(6)}
              </p>
            </div>
            <div>
              <p className="font-semibold">Estimated Yield (Annual)</p>
              <p className="font-mono bg-gray-100 p-1 rounded mt-1">
                NAV × (1 + (APY / 100))
              </p>
              <p className="mt-1">
                {currentNav.toFixed(6)} × (1 + {simulatedApy / 100}) ={" "}
                {navWithYield.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ERC4626NAVPanel;
