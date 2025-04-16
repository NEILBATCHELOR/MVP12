import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  Layers,
  Home,
  PieChart,
  ShieldCheck,
  UserRoundCog,
  Scale,
  WalletCards,
  FileStackIcon,
  UserRoundPlus,
  Landmark,
  Activity,
  Wallet,
  KeyRound,
  Coins,
  LayoutDashboard,
  Fingerprint,
  CreditCard,
  Shield,
  FileText,
  Plus,
  CheckCircle,
  LogOut,
  FileCog,
  Building,
  Layout,
  CheckSquare,
  ShieldAlert,
  History,
  Settings,
  BarChart,
  Menu,
  Package,
  ShoppingCart,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { sessionManager } from "@/lib/sessionManager";
import { Loader2 } from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface UserInfo {
  name: string;
  email: string;
}

const SidebarItem = ({ icon, label, href }: SidebarItemProps) => {
  const location = useLocation();
  // Check if the current path starts with the href to ensure only one item is active
  const isActive =
    location.pathname === href ||
    (href !== "/" && location.pathname.startsWith(href + "/"));

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-primary/10",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground",
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const { projectId } = useParams();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      setSelectedProject(projectId);
    }

    const fetchUserInfo = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }

        // Get user info from users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user info:', error);
          setIsLoading(false);
          return;
        }

        if (userData) {
          setUserInfo({
            name: userData.name,
            email: userData.email
          });
        }
      } catch (error) {
        console.error('Error in fetchUserInfo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <div className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold">Chain Capital</h2>
          <p className="text-xs text-muted-foreground">Tokenization Platform</p>
        </div>
        <ScrollArea className="flex-1 px-4">       
          <div className="space-y-6">
          <div>
              <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
                ONBOARDING
              </h3>
              <div className="space-y-1">
              <SidebarItem
                  icon={<UserRoundPlus className="h-4 w-4" />}
                  label="Investor Onboarding"
                  href="/compliance/investor-onboarding/registration"
                />
                <SidebarItem
                  icon={<Landmark className="h-4 w-4" />}
                  label="Issuer Onboarding"
                  href="/compliance/issuer/onboarding/registration"
                />
              </div>
            </div>
            <div>
              <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
                OVERVIEW
              </h3>
              <div className="space-y-1">
                <SidebarItem
                  icon={<Home className="h-4 w-4" />}
                  label="Dashboard"
                  href="/dashboard"
                />
                <SidebarItem
                  icon={<Layers className="h-4 w-4" />}
                  label="Projects"
                  href="/projects"
                />
              </div>
            </div>
            <div>
              <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
                ISSUANCE
              </h3>
              <div className="space-y-1">
                <SidebarItem
                  icon={<PieChart className="h-4 w-4" />}
                  label="Issuance"
                  href={`/projects/${projectId}/tokens`}
                />
                <SidebarItem
                  icon={<WalletCards className="h-4 w-4" />}
                  label="Redemptions"
                  href="/redemption"
                />
              </div>
            </div>

            <div>
              <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
                WALLET MANAGEMENT
              </h3>
              <div className="space-y-1">
                <SidebarItem
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  label="Wallet Dashboard"
                  href="/wallet/dashboard"
                />
                <SidebarItem
                  icon={<Plus className="h-4 w-4" />}
                  label="New Wallet"
                  href="/wallet/new"
                />
                <SidebarItem
                  icon={<ArrowLeftRight className="h-4 w-4" />}
                  label="Transfer Assets"
                  href="/wallet/transfer"
                />
                <SidebarItem
                  icon={<Coins className="h-4 w-4" />}
                  label="Swap Tokens"
                  href="/wallet/swap"
                />
              </div>
            </div>
            <div>
              <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
                COMPLIANCE
              </h3>
              <div className="space-y-1">
                <SidebarItem
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  label="Compliance Dashboard"
                  href="/compliance/operations/dashboard"
                />
                <SidebarItem
                  icon={<Wallet className="h-4 w-4" />}
                  label="Wallet Operations"
                  href="/compliance/operations/investor/wallets"
                />
                <SidebarItem
                  icon={<Scale className="h-4 w-4" />}
                  label="Compliance Rules"
                  href="/compliance/rules"
                />
                <SidebarItem
                  icon={<Shield className="h-4 w-4" />}
                  label="Restrictions"
                  href="/compliance/restrictions"
                />
              </div>
            </div>
            <div>
              <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
                ADMINISTRATION
              </h3>
              <div className="space-y-1">
                <SidebarItem
                  icon={<UserRoundCog className="h-4 w-4" />}
                  label="Roles"
                  href="/role-management"
                />
                <SidebarItem
                  icon={<Activity className="h-4 w-4" />}
                  label="Activity Monitor"
                  href="/activity"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="text-lg font-semibold text-primary">
                  {userInfo?.name?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
                </div>
              ) : userInfo ? (
                <>
                  <p className="truncate text-sm font-medium">{userInfo.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{userInfo.email}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">Guest User</p>
                  <p className="text-xs text-muted-foreground">Not signed in</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={async () => {
              // Clear local storage
              localStorage.clear();
              // Clear session storage
              sessionStorage.clear();
              // Clear Supabase session
              await supabase.auth.signOut();
              // Clear session in database
              await sessionManager.clearAllSessions();
              // Redirect to welcome screen
              window.location.href = '/';
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
