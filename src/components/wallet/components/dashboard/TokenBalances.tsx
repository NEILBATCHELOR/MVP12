import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, ArrowUpDown, ExternalLink, Plus, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

// Mock token data - in a real app, this would come from an API or context
const tokens = [
  {
    id: "1",
    name: "Ethereum",
    symbol: "ETH",
    type: "native",
    balance: "3.542",
    value: 12589.63,
    price: 3554.10,
    priceChange: 2.5,
    network: "ethereum",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    lastUpdated: "2023-07-15T12:34:56Z",
  },
  {
    id: "2",
    name: "USD Coin",
    symbol: "USDC",
    type: "erc20",
    balance: "5230.45",
    value: 5230.45,
    price: 1.00,
    priceChange: 0.01,
    network: "ethereum",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: 6,
    lastUpdated: "2023-07-15T12:34:56Z",
  },
  {
    id: "3",
    name: "Matic",
    symbol: "MATIC",
    type: "native",
    balance: "1253.78",
    value: 1316.47,
    price: 1.05,
    priceChange: -2.3,
    network: "polygon",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    lastUpdated: "2023-07-15T12:34:56Z",
  },
  {
    id: "4",
    name: "Avalanche",
    symbol: "AVAX",
    type: "native",
    balance: "45.67",
    value: 1187.42,
    price: 26.00,
    priceChange: 4.2,
    network: "avalanche",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    lastUpdated: "2023-07-15T12:34:56Z",
  },
  {
    id: "5",
    name: "Chainlink",
    symbol: "LINK",
    type: "erc20",
    balance: "125.5",
    value: 1882.5,
    price: 15.00,
    priceChange: 1.8,
    network: "ethereum",
    address: "0x514910771af9ca656af840dff83e8264ecf986ca",
    decimals: 18,
    lastUpdated: "2023-07-15T12:34:56Z",
  },
  {
    id: "6",
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    type: "erc20",
    balance: "0.25",
    value: 14875.00,
    price: 59500.00,
    priceChange: 3.1,
    network: "ethereum",
    address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    decimals: 8,
    lastUpdated: "2023-07-15T12:34:56Z",
  },
  {
    id: "7",
    name: "Uniswap",
    symbol: "UNI",
    type: "erc20",
    balance: "52.34",
    value: 732.76,
    price: 14.00,
    priceChange: -1.2,
    network: "ethereum",
    address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    decimals: 18,
    lastUpdated: "2023-07-15T12:34:56Z",
  },
  {
    id: "8",
    name: "Aave",
    symbol: "AAVE",
    type: "erc20",
    balance: "3.45",
    value: 344.65,
    price: 99.90,
    priceChange: 2.1,
    network: "polygon",
    address: "0xd6df932a45c0f255f85145f286ea0b292b21c90b",
    decimals: 18,
    lastUpdated: "2023-07-15T12:34:56Z",
  },
];

// Function to format number with commas
const formatNumber = (num: number, digits = 2) => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
};

// Function to get network badge with proper colors
const getNetworkBadge = (network: string) => {
  const networkColors: Record<string, { bg: string, text: string }> = {
    ethereum: { bg: 'bg-blue-50', text: 'text-blue-600' },
    polygon: { bg: 'bg-purple-50', text: 'text-purple-600' },
    avalanche: { bg: 'bg-red-50', text: 'text-red-600' },
    arbitrum: { bg: 'bg-sky-50', text: 'text-sky-600' },
    optimism: { bg: 'bg-rose-50', text: 'text-rose-600' },
    solana: { bg: 'bg-green-50', text: 'text-green-600' },
    bitcoin: { bg: 'bg-amber-50', text: 'text-amber-600' },
  };
  
  const colors = networkColors[network.toLowerCase()] || { bg: 'bg-gray-50', text: 'text-gray-600' };
  
  return (
    <Badge variant="outline" className={`${colors.bg} ${colors.text}`}>
      {network.charAt(0).toUpperCase() + network.slice(1)}
    </Badge>
  );
};

export const TokenBalances: React.FC = () => {
  const { selectedWallet } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof typeof tokens[0]>("value");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Filter tokens by search query
  const filteredTokens = tokens.filter((token) => {
    const query = searchQuery.toLowerCase();
    return (
      token.name.toLowerCase().includes(query) ||
      token.symbol.toLowerCase().includes(query) ||
      token.network.toLowerCase().includes(query)
    );
  });

  // Sort tokens
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    let aValue = a[sortKey];
    let bValue = b[sortKey];
    
    // For numeric values, make sure we're comparing numbers
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    // For string values, use string comparison
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  // Sort handler
  const handleSort = (key: keyof typeof tokens[0]) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Token Balances</CardTitle>
            <CardDescription>
              Manage your tokens across multiple chains
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Token
            </Button>
            <Button variant="outline">
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Receive
            </Button>
            <Button>
              <ArrowUpFromLine className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by token name, symbol, or network..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button 
                    variant="ghost" 
                    className="px-0 hover:bg-transparent flex items-center"
                    onClick={() => handleSort("name")}
                  >
                    <span>Token</span>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="px-0 hover:bg-transparent flex items-center"
                    onClick={() => handleSort("balance")}
                  >
                    <span>Balance</span>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <Button 
                    variant="ghost" 
                    className="px-0 hover:bg-transparent flex items-center"
                    onClick={() => handleSort("price")}
                  >
                    <span>Price</span>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <Button 
                    variant="ghost" 
                    className="px-0 hover:bg-transparent flex items-center"
                    onClick={() => handleSort("value")}
                  >
                    <span>Value</span>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Network</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                        <span className="font-medium text-xs">{token.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{token.name}</div>
                        <div className="text-sm text-muted-foreground">{token.symbol}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatNumber(parseFloat(token.balance), 6)}</div>
                    <div className="text-sm text-muted-foreground">{token.symbol}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="font-medium">${formatNumber(token.price)}</div>
                    <div className={`text-sm ${token.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {token.priceChange >= 0 ? '+' : ''}{token.priceChange}%
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="font-medium">${formatNumber(token.value)}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {getNetworkBadge(token.network)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Token Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <ArrowUpFromLine className="mr-2 h-4 w-4" />
                            Send
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ArrowDownToLine className="mr-2 h-4 w-4" />
                            Receive
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Token Info</DropdownMenuItem>
                          <DropdownMenuItem>View on Explorer</DropdownMenuItem>
                          <DropdownMenuItem>Copy Token Address</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Hide Token
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredTokens.length === 0 && (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No tokens found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};