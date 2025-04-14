import React, { useState } from "react";
import { Settings, LogOut, Menu, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import NotificationCenter from "./notifications/NotificationCenter";
import { useNotifications } from "@/context/NotificationContext";

interface DashboardHeaderProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notificationCount?: number;
  onMenuToggle?: () => void;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  onSearch?: (query: string) => void;
  searchValue?: string;
}

const DashboardHeader = ({
  userName = "John Doe",
  userEmail = "john.doe@example.com",
  userAvatar = "https://api.dicebear.com/7.x/initials/svg?seed=investor",
  notificationCount,
  onMenuToggle = () => {},
  onSearch,
  searchValue = "",
}: DashboardHeaderProps) => {
  const {
    notifications,
    markAsRead,
    dismissNotification,
    markAllAsRead,
    clearAll,
  } = useNotifications();
  const unreadCount =
    notifications?.filter((n) => !n.read).length || notificationCount || 0;

  const [searchQuery, setSearchQuery] = useState(searchValue);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <header className="w-full h-20 bg-background border-b border-border flex items-center justify-between px-4 md:px-6 lg:px-8">
      {/* Left section with logo and menu toggle */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">
              CR
            </span>
          </div>
          <h1 className="text-xl font-bold hidden md:block">
            Chain Capital Redemptions
          </h1>
        </div>
      </div>
      {/* Center section with search (hidden on mobile) */}
      <div className="hidden md:flex items-center max-w-md w-full mx-4 relative">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search redemption requests..."
            className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      {/* Right section with notifications and user profile */}
      <div className="flex items-center gap-2">
        <NotificationCenter
          notifications={notifications}
          onNotificationClick={(notification) => markAsRead(notification.id)}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearAll}
          onDismiss={dismissNotification}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
