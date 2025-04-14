import React, { useState, useEffect } from "react";
import { useNotifications } from "@/context/NotificationContext";
import {
  format,
  addMonths,
  isSameDay,
  isAfter,
  isBefore,
  addDays,
} from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  CalendarIcon,
  InfoIcon,
  ArrowRightIcon,
  DollarSignIcon,
} from "lucide-react";

interface RedemptionWindow {
  startDate: Date;
  endDate: Date;
  navUpdateDate: Date;
  eligibilityStartDate: Date;
  eligibilityEndDate: Date;
  estimatedValue: string;
  status: "upcoming" | "active" | "closed";
}

interface RedemptionCalendarProps {
  redemptionWindows?: RedemptionWindow[];
  onSelectDate?: (date: Date) => void;
  onInitiateRedemption?: (window: RedemptionWindow) => void;
}

const RedemptionCalendar = ({
  redemptionWindows = [
    {
      startDate: addDays(new Date(), 5),
      endDate: addDays(new Date(), 12),
      navUpdateDate: addDays(new Date(), 3),
      eligibilityStartDate: new Date(),
      eligibilityEndDate: addDays(new Date(), 4),
      estimatedValue: "$1,250,000",
      status: "upcoming" as const,
    },
    {
      startDate: addDays(new Date(), 35),
      endDate: addDays(new Date(), 42),
      navUpdateDate: addDays(new Date(), 33),
      eligibilityStartDate: addDays(new Date(), 30),
      eligibilityEndDate: addDays(new Date(), 34),
      estimatedValue: "$1,300,000",
      status: "upcoming" as const,
    },
    {
      startDate: addDays(new Date(), -15),
      endDate: addDays(new Date(), -8),
      navUpdateDate: addDays(new Date(), -17),
      eligibilityStartDate: addDays(new Date(), -20),
      eligibilityEndDate: addDays(new Date(), -16),
      estimatedValue: "$1,200,000",
      status: "closed" as const,
    },
  ],
  onSelectDate = () => {},
  onInitiateRedemption = () => {},
}: RedemptionCalendarProps) => {
  const { addNotification } = useNotifications();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [selectedWindow, setSelectedWindow] = useState<RedemptionWindow | null>(
    null,
  );

  // Function to determine if a date is within any redemption window
  const isRedemptionDate = (day: Date) => {
    return redemptionWindows.some(
      (window) =>
        (isAfter(day, window.startDate) && isBefore(day, window.endDate)) ||
        isSameDay(day, window.startDate) ||
        isSameDay(day, window.endDate),
    );
  };

  // Function to determine if a date is a NAV update date
  const isNavUpdateDate = (day: Date) => {
    return redemptionWindows.some((window) =>
      isSameDay(day, window.navUpdateDate),
    );
  };

  // Function to determine if a date is within eligibility period
  const isEligibilityDate = (day: Date) => {
    return redemptionWindows.some(
      (window) =>
        (isAfter(day, window.eligibilityStartDate) &&
          isBefore(day, window.eligibilityEndDate)) ||
        isSameDay(day, window.eligibilityStartDate) ||
        isSameDay(day, window.eligibilityEndDate),
    );
  };

  // Function to get window for a specific date
  const getWindowForDate = (day: Date): RedemptionWindow | undefined => {
    return redemptionWindows.find(
      (window) =>
        (isAfter(day, window.startDate) && isBefore(day, window.endDate)) ||
        isSameDay(day, window.startDate) ||
        isSameDay(day, window.endDate) ||
        isSameDay(day, window.navUpdateDate) ||
        (isAfter(day, window.eligibilityStartDate) &&
          isBefore(day, window.eligibilityEndDate)) ||
        isSameDay(day, window.eligibilityStartDate) ||
        isSameDay(day, window.eligibilityEndDate),
    );
  };

  // Handle date selection
  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      onSelectDate(selectedDate);

      const window = getWindowForDate(selectedDate);
      setSelectedWindow(window || null);
    }
  };

  // Custom day rendering for the calendar
  const renderDay = (day: Date, modifiers: any) => {
    const isRedemption = isRedemptionDate(day);
    const isNav = isNavUpdateDate(day);
    const isEligibility = isEligibilityDate(day);

    return (
      <div className="relative w-full h-full">
        {day.getDate()}
        {isRedemption && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 rounded-full" />
        )}
        {isNav && (
          <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        )}
        {isEligibility && (
          <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-yellow-500 rounded-full" />
        )}
      </div>
    );
  };

  const handleInitiateRedemption = (window: RedemptionWindow) => {
    onInitiateRedemption(window);
    // Redemption window notifications disabled to reduce distractions
  };

  // Redemption window notifications disabled to reduce distractions

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Redemption Calendar
            </h2>
            <p className="text-gray-600">
              View upcoming redemption windows and NAV updates
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Legend</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">Redemption Window</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm">NAV Update</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm">Eligibility Period</span>
              </div>
            </div>
          </div>

          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            month={month}
            onMonthChange={setMonth}
            className="border rounded-md"
            // Custom day rendering would go here in a real implementation
            // This is a simplified version as the actual implementation would require modifying the Calendar component
          />

          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => setMonth(addMonths(month, -1))}
            >
              Previous Month
            </Button>
            <Button
              variant="outline"
              onClick={() => setMonth(addMonths(month, 1))}
            >
              Next Month
            </Button>
          </div>
        </div>

        <div className="lg:w-1/2">
          {selectedWindow ? (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Redemption Window Details</CardTitle>
                <CardDescription>
                  {format(selectedWindow.startDate, "MMMM d, yyyy")} -{" "}
                  {format(selectedWindow.endDate, "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status</span>
                  <Badge
                    variant={
                      selectedWindow.status === "active"
                        ? "default"
                        : selectedWindow.status === "upcoming"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {selectedWindow.status.charAt(0).toUpperCase() +
                      selectedWindow.status.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Important Dates</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">NAV Update</span>
                      <span className="text-sm font-medium">
                        {format(selectedWindow.navUpdateDate, "MMMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Eligibility Period
                      </span>
                      <span className="text-sm font-medium">
                        {format(selectedWindow.eligibilityStartDate, "MMM d")} -{" "}
                        {format(
                          selectedWindow.eligibilityEndDate,
                          "MMM d, yyyy",
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Redemption Window
                      </span>
                      <span className="text-sm font-medium">
                        {format(selectedWindow.startDate, "MMM d")} -{" "}
                        {format(selectedWindow.endDate, "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSignIcon className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="font-medium">Estimated NAV</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Estimated Net Asset Value based on current holdings
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {selectedWindow.estimatedValue}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={selectedWindow.status === "closed"}
                  onClick={() => handleInitiateRedemption(selectedWindow)}
                >
                  {selectedWindow.status === "active"
                    ? "Initiate Redemption"
                    : selectedWindow.status === "upcoming"
                      ? "Set Reminder"
                      : "Window Closed"}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  No Date Selected
                </h3>
                <p className="text-gray-600 mb-4">
                  Select a date on the calendar to view redemption details
                </p>
                <Button variant="outline" onClick={() => setDate(new Date())}>
                  View Today
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">
          Upcoming Redemption Windows
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {redemptionWindows
            .filter((window) => window.status !== "closed")
            .map((window, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {format(window.startDate, "MMMM yyyy")} Window
                  </CardTitle>
                  <CardDescription>
                    {format(window.startDate, "MMM d")} -{" "}
                    {format(window.endDate, "MMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">NAV Update:</span>
                    <span>{format(window.navUpdateDate, "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Est. Value:</span>
                    <span className="font-medium">{window.estimatedValue}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-center"
                    onClick={() => {
                      setDate(window.startDate);
                      setSelectedWindow(window);
                      // Scroll to the details section
                      document
                        .querySelector(".lg\\:w-1\\/2:last-child")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    View Details <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RedemptionCalendar;
