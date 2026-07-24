import React from "react";
import { useWorkout, DAYS_OF_WEEK, DayOfWeek } from "../context/WorkoutContext";

export const DayTabs: React.FC = () => {
  const { activeDay, setActiveDay, plan } = useWorkout();

  // Full day name mapper for desktop readability
  const fullDayNames: Record<DayOfWeek, string> = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday",
  };

  return (
    <div className="w-full border-b border-ledger-border bg-ledger-card/50">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <nav className="flex overflow-x-auto no-scrollbar py-2" aria-label="Tabs">
          <div className="flex gap-2 min-w-full">
            {DAYS_OF_WEEK.map((day) => {
              const isActive = activeDay === day;
              const exercisesCount = plan[day]?.length || 0;

              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex flex-1 flex-col items-center justify-center rounded border px-3 py-2.5 min-w-[64px] transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "border-ledger-accent bg-ledger-bg text-ledger-accent shadow-sm shadow-ledger-accent/10"
                      : "border-ledger-border bg-ledger-card/25 text-ledger-muted hover:border-ledger-muted/40 hover:text-ledger-text"
                  }`}
                >
                  <span className="font-heading text-sm font-bold tracking-wider uppercase sm:text-base">
                    {day}
                  </span>
                  <span className="hidden text-[10px] text-ledger-muted sm:inline mt-0.5">
                    {fullDayNames[day]}
                  </span>
                  <span
                    className={`font-mono text-[10px] mt-1 px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-ledger-accent/20 text-ledger-accent"
                        : exercisesCount > 0
                        ? "bg-ledger-border text-ledger-text"
                        : "bg-transparent text-ledger-muted/40"
                    }`}
                  >
                    {exercisesCount}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};
