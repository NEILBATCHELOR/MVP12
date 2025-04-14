import React, { useState } from "react";
import CountrySelector from "@/components/shared/CountrySelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CountrySelectorStoryboard() {
  const [selectedCountry, setSelectedCountry] = useState("");

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Country Selector Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CountrySelector
            value={selectedCountry}
            onValueChange={setSelectedCountry}
            label="Country of Residence"
            required
          />

          {selectedCountry && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <p>
                Selected country: <strong>{selectedCountry}</strong>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
