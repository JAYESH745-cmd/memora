import React from "react";
import { Bell, Menu, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={toggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 md:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="hidden h-10 w-80 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 lg:flex">
          <Search size={17} />
          <span>Search documents, flashcards, quizzes</span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-400" />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold shadow-sm">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="hidden text-sm sm:block">
            <p className="font-semibold leading-5">{user?.username || "User"}</p>
            <p className="max-w-44 truncate text-slate-400 text-xs">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
