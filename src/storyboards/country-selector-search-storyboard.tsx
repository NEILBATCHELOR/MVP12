import React, { useState } from "react";
import CountrySelector from "@/components/shared/CountrySelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCountryNameById } from "@/lib/countries";

export default function CountrySelectorSearchStoryboard() {
  const [selectedCountry, setSelectedCountry] = useState("");

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Country Selector with Search</CardTitle>
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
                Selected country:{" "}
                <strong>{getCountryNameById(selectedCountry)}</strong>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
