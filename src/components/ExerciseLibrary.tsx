import React, { useState } from "react";
import { EXERCISE_LIBRARY } from "../data/exerciseLibrary";
import { useWorkout } from "../context/WorkoutContext";
import { Search, Plus, Dumbbell, Award } from "lucide-react";

export const ExerciseLibrary: React.FC = () => {
  const { activeDay, addExercise } = useWorkout();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [customName, setCustomName] = useState("");

  const categories = ["All", "Push", "Pull", "Legs", "Core", "Cardio"];

  // Handle custom exercise submission
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    addExercise(activeDay, customName.trim());
    setCustomName("");
  };

  // Filter exercises
  const getFilteredExercises = () => {
    let result: { name: string; category: string }[] = [];

    Object.entries(EXERCISE_LIBRARY).forEach(([category, exercises]) => {
      exercises.forEach((exName) => {
        result.push({ name: exName, category });
      });
    });

    if (selectedCategory !== "All") {
      result = result.filter((ex) => ex.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((ex) => ex.name.toLowerCase().includes(query));
    }

    return result;
  };

  const filteredExercises = getFilteredExercises();

  return (
    <div className="flex flex-col h-full rounded border border-ledger-border bg-ledger-card p-4 sm:p-6 shadow-md">
      {/* Panel Header */}
      <div className="mb-6">
        <h2 className="font-heading text-xl font-bold tracking-wider text-ledger-text uppercase flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-ledger-accent" />
          Add Exercise
        </h2>
        <p className="font-mono text-[10px] text-ledger-muted uppercase mt-1">
          // Add to {activeDay}'s Ledger
        </p>
      </div>

      {/* 1. Custom Exercise Form */}
      <form onSubmit={handleAddCustom} className="mb-6">
        <label className="block font-mono text-[10px] font-bold tracking-wider text-ledger-muted uppercase mb-2">
          Custom Exercise
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g. Incline Cable Flye"
            className="flex-1 rounded border border-ledger-border bg-ledger-bg px-3 py-2 text-sm text-ledger-text placeholder-ledger-muted/50 focus:border-ledger-accent focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!customName.trim()}
            className="flex items-center justify-center rounded bg-ledger-accent px-3 py-2 text-ledger-bg hover:bg-ledger-accent-hover disabled:opacity-40 disabled:hover:bg-ledger-accent transition-colors cursor-pointer"
            title="Add Custom Exercise"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="border-t border-ledger-border/60 my-4"></div>

      {/* 2. Library Search & Filter */}
      <div className="flex flex-col gap-4 mb-4">
        <div>
          <label className="block font-mono text-[10px] font-bold tracking-wider text-ledger-muted uppercase mb-2">
            Exercise Library
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ledger-muted/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full rounded border border-ledger-border bg-ledger-bg pl-9 pr-3 py-2 text-sm text-ledger-text placeholder-ledger-muted/50 focus:border-ledger-accent focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase transition-all cursor-pointer ${
                  isSelected
                    ? "bg-ledger-accent text-ledger-bg font-bold"
                    : "bg-ledger-bg text-ledger-muted border border-ledger-border/40 hover:border-ledger-muted/40 hover:text-ledger-text"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Filtered Exercises List */}
      <div className="flex-1 overflow-y-auto max-h-[350px] lg:max-h-[500px] border border-ledger-border/40 rounded bg-ledger-bg/30 p-2 custom-scrollbar">
        {filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 gap-1.5">
            {filteredExercises.map((ex) => (
              <button
                key={`${ex.category}-${ex.name}`}
                type="button"
                onClick={() => addExercise(activeDay, ex.name)}
                className="flex items-center justify-between w-full rounded border border-ledger-border/20 bg-ledger-card/30 hover:bg-ledger-card hover:border-ledger-accent/40 p-2.5 text-left text-sm text-ledger-text group transition-all cursor-pointer"
              >
                <span className="font-medium group-hover:text-ledger-accent transition-colors">
                  {ex.name}
                </span>
                <span className="font-mono text-[9px] text-ledger-muted/60 bg-ledger-bg px-1.5 py-0.5 rounded uppercase border border-ledger-border/20">
                  {ex.category}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-ledger-muted">
            <Award className="h-8 w-8 text-ledger-muted/20 mb-2" />
            <p className="text-xs">No matching exercises found.</p>
            <p className="text-[10px] font-mono mt-1">
              Add it as a custom exercise above!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
