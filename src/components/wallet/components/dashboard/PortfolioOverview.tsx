import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/context/WalletContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Placeholder data - would come from an API or context in a real application
const portfolioData = [
  { date: "Jan", Ethereum: 4000, Polygon: 2400, Avalanche: 1400, Bitcoin: 4500 },
  { date: "Feb", Ethereum: 3500, Polygon: 2200, Avalanche: 1200, Bitcoin: 4700 },
  { date: "Mar", Ethereum: 4200, Polygon: 2800, Avalanche: 1300, Bitcoin: 4800 },
  { date: "Apr", Ethereum: 5000, Polygon: 3100, Avalanche: 1500, Bitcoin: 5000 },
  { date: "May", Ethereum: 4800, Polygon: 2900, Avalanche: 1700, Bitcoin: 5100 },
  { date: "Jun", Ethereum: 5500, Polygon: 3300, Avalanche: 1900, Bitcoin: 5300 },
  { date: "Jul", Ethereum: 6200, Polygon: 3700, Avalanche: 2100, Bitcoin: 5500 },
  { date: "Aug", Ethereum: 6500, Polygon: 3900, Avalanche: 2200, Bitcoin: 5400 },
  { date: "Sep", Ethereum: 6800, Polygon: 4100, Avalanche: 2300, Bitcoin: 5600 },
  { date: "Oct", Ethereum: 7200, Polygon: 4300, Avalanche: 2500, Bitcoin: 5700 },
  { date: "Nov", Ethereum: 7500, Polygon: 4500, Avalanche: 2700, Bitcoin: 6000 },
  { date: "Dec", Ethereum: 8000, Polygon: 4800, Avalanche: 2900, Bitcoin: 6200 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-sm p-3">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const PortfolioOverview: React.FC = () => {
  const { wallets } = useWallet();
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>Asset value over time</CardDescription>
          </div>
          <Tabs defaultValue="1y" className="w-[200px]">
            <TabsList>
              <TabsTrigger value="1m">1M</TabsTrigger>
              <TabsTrigger value="3m">3M</TabsTrigger>
              <TabsTrigger value="6m">6M</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={portfolioData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorEthereum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPolygon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAvalanche" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBitcoin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" />
              <YAxis 
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="Ethereum"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#colorEthereum)"
              />
              <Area
                type="monotone"
                dataKey="Polygon"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorPolygon)"
              />
              <Area
                type="monotone"
                dataKey="Avalanche"
                stroke="#ec4899"
                fillOpacity={1}
                fill="url(#colorAvalanche)"
              />
              <Area
                type="monotone"
                dataKey="Bitcoin"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorBitcoin)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
            <span className="text-sm">Ethereum</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
            <span className="text-sm">Polygon</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
            <span className="text-sm">Avalanche</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
            <span className="text-sm">Bitcoin</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};