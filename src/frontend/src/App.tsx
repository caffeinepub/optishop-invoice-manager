import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  FilePlus,
  FileText,
  Glasses,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  Package,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { useInternetIdentity } from "./hooks/useInternetIdentity";

import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import NewOrder from "./pages/NewOrder";
import Stock from "./pages/Stock";

type Page = "dashboard" | "new_order" | "invoices" | "stock";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  ocid: string;
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    ocid: "nav.dashboard.link",
  },
  {
    id: "new_order",
    label: "New Order",
    icon: <FilePlus className="h-4 w-4" />,
    ocid: "nav.new_order.link",
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: <FileText className="h-4 w-4" />,
    ocid: "nav.invoices.link",
  },
  {
    id: "stock",
    label: "Stock",
    icon: <Package className="h-4 w-4" />,
    ocid: "nav.stock.link",
  },
];

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();

  const navigate = (page: Page) => {
    setActivePage(page);
    setMobileNavOpen(false);
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "new_order":
        return <NewOrder />;
      case "invoices":
        return <Invoices />;
      case "stock":
        return <Stock />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster richColors position="top-right" />

      {/* Top Header */}
      <header className="no-print sticky top-0 z-50 bg-sidebar border-b border-sidebar-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Glasses className="h-4.5 w-4.5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg text-sidebar-foreground tracking-tight">
                Specssify Infusion
              </span>
              <span className="hidden sm:block text-[10px] text-sidebar-foreground/50 font-medium -mt-1">
                PVT. LTD
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                data-ocid={item.ocid}
                onClick={() => navigate(item.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
                  activePage === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Auth controls + Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            {/* Login / Logout */}
            {!isInitializing &&
              (identity ? (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-sidebar-foreground/70 font-medium">
                    <User className="h-3.5 w-3.5 text-sidebar-primary" />
                    Logged in
                  </span>
                  <Button
                    data-ocid="auth.logout.button"
                    variant="outline"
                    size="sm"
                    onClick={clear}
                    className="h-7 text-xs gap-1.5 border-sidebar-border text-sidebar-foreground/80 hover:bg-sidebar-accent"
                  >
                    <LogOut className="h-3 w-3" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  data-ocid="auth.login.button"
                  variant="outline"
                  size="sm"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="hidden sm:flex h-7 text-xs gap-1.5 border-sidebar-border text-sidebar-foreground/80 hover:bg-sidebar-accent"
                >
                  {isLoggingIn ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <LogIn className="h-3 w-3" />
                  )}
                  {isLoggingIn ? "Logging in…" : "Login"}
                </Button>
              ))}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileNavOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-sidebar-border overflow-hidden bg-sidebar"
            >
              <nav className="px-4 py-2 space-y-1">
                {navItems.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    data-ocid={item.ocid}
                    onClick={() => navigate(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                      activePage === item.id
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
                <div className="pt-2 pb-1 border-t border-sidebar-border mt-2">
                  {identity ? (
                    <button
                      type="button"
                      data-ocid="auth.logout.button"
                      onClick={() => {
                        clear();
                        setMobileNavOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  ) : (
                    <button
                      type="button"
                      data-ocid="auth.login.button"
                      onClick={() => {
                        login();
                        setMobileNavOpen(false);
                      }}
                      disabled={isLoggingIn}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150 disabled:opacity-50"
                    >
                      {isLoggingIn ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogIn className="h-4 w-4" />
                      )}
                      {isLoggingIn ? "Logging in…" : "Login"}
                    </button>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-border py-4 px-6 mt-auto">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-destructive" aria-label="love">
            ♥
          </span>{" "}
          using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
