import React from "react";
import { useAuth } from "../context/AuthContext";
import { useWorkout } from "../context/WorkoutContext";
import { LogOut, Dumbbell, Loader2, Check, AlertCircle } from "lucide-react";

export const Header: React.FC = () => {
  const { user, signOutUser } = useAuth();
  const { saveStatus } = useWorkout();

  return (
    <header className="border-b border-ledger-border bg-ledger-card px-4 py-4 md:px-8 shadow-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        {/* Logo and branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded border border-ledger-accent/40 bg-ledger-bg text-ledger-accent">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-wider text-ledger-text uppercase sm:text-3xl">
              Iron Log
            </h1>
            <p className="font-mono text-[10px] tracking-widest text-ledger-accent uppercase">
              // Training Ledger
            </p>
          </div>
        </div>

        {/* Sync Status and User Controls */}
        {user && (
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 rounded border border-ledger-border bg-ledger-bg/60 px-3 py-1.5 font-mono text-xs">
              {saveStatus === "Saving" && (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-ledger-accent" />
                  <span className="text-ledger-accent uppercase font-semibold">Saving...</span>
                </>
              )}
              {saveStatus === "Synced" && (
                <>
                  <Check className="h-3.5 w-3.5 text-ledger-accent" />
                  <span className="text-ledger-muted uppercase">Synced</span>
                </>
              )}
              {saveStatus === "Error" && (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                  <span className="text-red-500 uppercase font-semibold">Sync Error</span>
                </>
              )}
              {!saveStatus && (
                <span className="text-ledger-muted uppercase">Offline State</span>
              )}
            </div>

            {/* User Profile & Sign Out */}
            <div className="flex items-center gap-3 border-l border-ledger-border pl-4 sm:pl-6">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="h-8 w-8 rounded-full border border-ledger-accent/30"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-ledger-accent/30 bg-ledger-bg font-mono text-xs text-ledger-accent uppercase">
                  {user.displayName?.slice(0, 2) || user.email?.slice(0, 2) || "U"}
                </div>
              )}
              <div className="hidden flex-col md:flex">
                <span className="text-xs font-semibold text-ledger-text">
                  {user.displayName || "Lifter"}
                </span>
                <span className="text-[10px] text-ledger-muted font-mono">
                  {user.email}
                </span>
              </div>
              <button
                onClick={signOutUser}
                className="flex items-center gap-1.5 rounded border border-ledger-border bg-ledger-bg px-2.5 py-1.5 font-mono text-[11px] text-ledger-muted hover:border-ledger-accent hover:text-ledger-accent transition-all duration-200"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
