import { useState } from "react";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface NavbarProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Navbar({ onMenuClick, showMenuButton = false }: NavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left section */}
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <h1 className="text-xl font-bold text-primary">EduLearn</h1>
        </div>

        {/* Right section - Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:opacity-90 transition-opacity"
          >
            <User className="h-5 w-5 text-white" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              />
              {/* Dropdown Card */}
              <div className="absolute right-0 top-full mt-2 w-48 z-20 overflow-hidden rounded-lg border bg-white shadow-lg">
                <div className="p-3 border-b">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-gray-500">john@example.com</p>
                </div>
                <div className="p-1">
                  <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-gray-100 transition-colors">
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <X className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
