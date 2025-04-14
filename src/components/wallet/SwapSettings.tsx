import React, { useState } from "react";
import { Settings } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface SwapSettingsProps {
  slippage: number;
  onSlippageChange: (value: number) => void;
}

export function SwapSettings({ slippage, onSlippageChange }: SwapSettingsProps) {
  const [slippageInput, setSlippageInput] = useState(slippage.toString());

  const handleSlippageChange = (value: string) => {
    setSlippageInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onSlippageChange(numValue);
    }
  };

  const presetSlippages = [0.1, 0.5, 1.0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Swap Settings</CardTitle>
            <CardDescription>
              Customize your swap parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slippage">Slippage Tolerance</Label>
                  <span className="text-xs text-muted-foreground">
                    {slippage}%
                  </span>
                </div>
                <div className="flex gap-2">
                  {presetSlippages.map((preset) => (
                    <Button
                      key={preset}
                      variant={slippage === preset ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSlippageInput(preset.toString());
                        onSlippageChange(preset);
                      }}
                      className="flex-1"
                    >
                      {preset}%
                    </Button>
                  ))}
                  <div className="relative flex-1">
                    <Input
                      id="slippage"
                      type="number"
                      value={slippageInput}
                      onChange={(e) => handleSlippageChange(e.target.value)}
                      className="pr-6"
                      min="0"
                      step="0.1"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
} 