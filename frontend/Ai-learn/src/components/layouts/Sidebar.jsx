import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isSidebarOpen, closeSidebar }) => {
  const { logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
     ${
       isActive
         ? "bg-slate-900 text-white shadow-sm"
         : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
     }`;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-slate-200 bg-white p-4 transition-transform duration-200 md:static md:z-auto md:w-64 md:translate-x-0
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}
    >
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="w-11 h-11 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
          <BookOpen className="text-white" size={24} />
        </div>
        <div>
          <span className="block text-lg font-bold text-slate-900">
            Memora
          </span>
          <span className="text-xs font-medium text-slate-500">
            AI learning workspace
          </span>
        </div>
      </div>

      <nav className="flex-1 pt-6 space-y-1.5">
        <NavLink to="/dashboard" className={linkClass} onClick={closeSidebar}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/documents" className={linkClass} onClick={closeSidebar}>
          <FileText size={20} />
          Documents
        </NavLink>
        <NavLink to="/flashcards" className={linkClass} onClick={closeSidebar}>
          <BookOpen size={20} />
          Flashcards
        </NavLink>
        <NavLink to="/profile" className={linkClass} onClick={closeSidebar}>
          <User size={20} />
          Profile
        </NavLink>
      </nav>

      <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm">
        <p className="font-semibold text-slate-900">Keep learning</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Review a few cards after every document for better retention.
        </p>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
