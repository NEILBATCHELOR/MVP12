import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Users, User, ArrowRight } from "lucide-react";

const RoleSelection = ({ setCurrentView }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Select Your Role</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Investor Portal</CardTitle>
              <User className="h-6 w-6 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Manage redemption requests and track status.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setCurrentView("investor-dashboard")}>
              Enter Investor Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Operations Portal</CardTitle>
              <Users className="h-6 w-6 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Manage redemption operations and approvals.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setCurrentView("operations-dashboard")}>
              Enter Operations Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RoleSelection;
