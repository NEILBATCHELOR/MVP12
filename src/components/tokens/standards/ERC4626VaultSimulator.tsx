import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { format } from "date-fns";

interface ERC4626VaultSimulatorProps {
  tokenForm: any;
  setTokenForm: (setter: (prev: any) => any) => void;
}

const ERC4626VaultSimulator: React.FC<ERC4626VaultSimulatorProps> = ({
  tokenForm,
  setTokenForm,
}) => {
  const [activeTab, setActiveTab] = useState("nav-simulation");
  const [simulationYears, setSimulationYears] = useState(5);
  const [initialInvestment, setInitialInvestment] = useState("10000");
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  // Get values from form or use defaults
  const initialNAV = parseFloat(tokenForm.metadata.initialNAV || "1.0");
  const estimatedAPY = parseFloat(tokenForm.metadata.estimatedApy || "5.2");
  const managementFee = parseFloat(tokenForm.metadata.managementFee || "2.0");
  const performanceFee = parseFloat(
    tokenForm.metadata.performanceFee || "20.0",
  );

  // Run simulation when parameters change
  useEffect(() => {
    runSimulation();
  }, [
    initialNAV,
    estimatedAPY,
    managementFee,
    performanceFee,
    simulationYears,
    initialInvestment,
  ]);

  // Function to run the NAV and investment simulation
  const runSimulation = () => {
    // Calculate NAV evolution
    const navData = calculateNAVEvolution(
      initialNAV.toString(),
      estimatedAPY.toString(),
      managementFee.toString(),
      performanceFee.toString(),
      simulationYears,
      12, // Monthly intervals
    );

    // Calculate investment value over time
    const investmentData = navData.map((point) => {
      const initialShares = parseFloat(initialInvestment) / initialNAV;
      const investmentValue = initialShares * parseFloat(point.nav);

      return {
        ...point,
        investmentValue: investmentValue.toFixed(2),
      };
    });

    setSimulationData(investmentData);

    // Calculate comparison data (no fees)
    const noFeesData = calculateNAVEvolution(
      initialNAV.toString(),
      estimatedAPY.toString(),
      "0", // No management fee
      "0", // No performance fee
      simulationYears,
      12, // Monthly intervals
    );

    const comparisonInvestmentData = noFeesData.map((point) => {
      const initialShares = parseFloat(initialInvestment) / initialNAV;
      const investmentValue = initialShares * parseFloat(point.nav);

      return {
        ...point,
        investmentValue: investmentValue.toFixed(2),
      };
    });

    setComparisonData(comparisonInvestmentData);
  };

  // Function to calculate NAV evolution over time
  const calculateNAVEvolution = (
    initialNAV: string,
    apyPercent: string,
    managementFeePercent: string,
    performanceFeePercent: string,
    periodInYears: number = 5,
    intervalsPerYear: number = 12,
  ): { timestamp: number; nav: string; date: string }[] => {
    try {
      const nav = parseFloat(initialNAV);
      const apy = parseFloat(apyPercent) / 100;
      const mgmtFee = parseFloat(managementFeePercent) / 100;
      const perfFee = parseFloat(performanceFeePercent) / 100;

      const totalIntervals = periodInYears * intervalsPerYear;
      const intervalInYears = 1 / intervalsPerYear;

      const result: { timestamp: number; nav: string; date: string }[] = [];
      let currentNAV = nav;
      const now = Date.now();

      // Add initial point
      result.push({
        timestamp: now,
        nav: currentNAV.toFixed(6),
        date: format(now, "MMM yyyy"),
      });

      // Calculate NAV for each interval
      for (let i = 1; i <= totalIntervals; i++) {
        // Calculate yield for this interval
        const yieldForInterval =
          currentNAV * (Math.pow(1 + apy, intervalInYears) - 1);

        // Calculate fee for this interval
        const feeForInterval = currentNAV * (1 - Math.pow(1 - mgmtFee / 12, 1));

        // Calculate performance fee if there was positive yield
        const perfFeeForInterval =
          yieldForInterval > 0 ? yieldForInterval * perfFee : 0;

        // Update NAV: NAVt = NAVt−1 + (Yield t − Fee t)
        currentNAV =
          currentNAV + yieldForInterval - feeForInterval - perfFeeForInterval;

        const timestamp =
          now + (i * (365 * 24 * 60 * 60 * 1000)) / intervalsPerYear;

        // Add to result (only add monthly points to keep chart clean)
        if (i % 1 === 0) {
          result.push({
            timestamp,
            nav: currentNAV.toFixed(6),
            date: format(timestamp, "MMM yyyy"),
          });
        }
      }

      return result;
    } catch (error) {
      console.error("Failed to calculate NAV evolution:", error);
      return [
        {
          timestamp: Date.now(),
          nav: initialNAV,
          date: format(Date.now(), "MMM yyyy"),
        },
      ];
    }
  };

  // Calculate final values for summary
  const initialShares = parseFloat(initialInvestment) / initialNAV;
  const finalNAV =
    simulationData.length > 0
      ? parseFloat(simulationData[simulationData.length - 1].nav)
      : initialNAV;
  const finalValue = initialShares * finalNAV;
  const totalReturn = (finalValue / parseFloat(initialInvestment) - 1) * 100;

  const finalNAVNoFees =
    comparisonData.length > 0
      ? parseFloat(comparisonData[comparisonData.length - 1].nav)
      : initialNAV;
  const finalValueNoFees = initialShares * finalNAVNoFees;
  const totalReturnNoFees =
    (finalValueNoFees / parseFloat(initialInvestment) - 1) * 100;

  const feesImpact = totalReturnNoFees - totalReturn;

  return (
    <div className="space-y-6 bg-white">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="nav-simulation">NAV Simulation</TabsTrigger>
          <TabsTrigger value="investment-projection">
            Investment Projection
          </TabsTrigger>
        </TabsList>

        {/* NAV Simulation Tab */}
        <TabsContent value="nav-simulation">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-md">
                NAV Evolution Simulation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialNAV">Initial NAV</Label>
                    <Input
                      id="initialNAV"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={tokenForm.metadata.initialNAV || "1.0"}
                      onChange={(e) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            initialNAV: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedApy">Estimated APY (%)</Label>
                    <Input
                      id="estimatedApy"
                      type="number"
                      min="0"
                      step="0.1"
                      value={tokenForm.metadata.estimatedApy || "5.2"}
                      onChange={(e) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            estimatedApy: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="managementFee">Management Fee (%)</Label>
                    <Input
                      id="managementFee"
                      type="number"
                      min="0"
                      step="0.1"
                      value={tokenForm.metadata.managementFee || "2.0"}
                      onChange={(e) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            managementFee: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="performanceFee">Performance Fee (%)</Label>
                    <Input
                      id="performanceFee"
                      type="number"
                      min="0"
                      step="0.1"
                      value={tokenForm.metadata.performanceFee || "20.0"}
                      onChange={(e) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            performanceFee: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <Label>Simulation Period (Years): {simulationYears}</Label>
                <Slider
                  value={[simulationYears]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setSimulationYears(value[0])}
                />
              </div>

              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => value} />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`$${value}`, "NAV"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="nav"
                      name="NAV ($)"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Initial NAV</p>
                  <p className="text-2xl font-bold">${initialNAV.toFixed(4)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Final NAV (After {simulationYears} Years)
                  </p>
                  <p className="text-2xl font-bold">${finalNAV.toFixed(4)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">NAV Growth</p>
                  <p className="text-2xl font-bold">
                    {((finalNAV / initialNAV - 1) * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investment Projection Tab */}
        <TabsContent value="investment-projection">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-md">
                Investment Value Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="initialInvestment">
                    Initial Investment ($)
                  </Label>
                  <Input
                    id="initialInvestment"
                    type="number"
                    min="100"
                    step="100"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Simulation Period (Years): {simulationYears}</Label>
                  <Slider
                    value={[simulationYears]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setSimulationYears(value[0])}
                  />
                </div>
              </div>

              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => value} />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`$${value}`, "Investment Value"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="investmentValue"
                      name="With Fees ($)"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    {comparisonData.length > 0 && (
                      <Line
                        type="monotone"
                        dataKey="investmentValue"
                        name="Without Fees ($)"
                        stroke="#82ca9d"
                        data={comparisonData}
                        activeDot={{ r: 8 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Initial Investment</p>
                  <p className="text-2xl font-bold">
                    ${parseFloat(initialInvestment).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Final Value (After {simulationYears} Years)
                  </p>
                  <p className="text-2xl font-bold">
                    $
                    {finalValue.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Return</p>
                  <p className="text-2xl font-bold">
                    {totalReturn.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-100 rounded-lg mb-4">
                <h4 className="font-medium mb-2">Fee Impact Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Return Without Fees</p>
                    <p className="text-xl font-bold">
                      {totalReturnNoFees.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fee Impact</p>
                    <p className="text-xl font-bold">
                      -{feesImpact.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>
                  This simulation shows the projected value of an investment in
                  this vault over time, accounting for:
                </p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Estimated annual yield: {estimatedAPY}%</li>
                  <li>Management fee: {managementFee}% annually</li>
                  <li>Performance fee: {performanceFee}% of profits</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ERC4626VaultSimulator;
