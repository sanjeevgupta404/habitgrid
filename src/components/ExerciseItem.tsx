import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Exercise, useWorkout } from "../context/WorkoutContext";

interface ExerciseItemProps {
  exercise: Exercise;
  index: number;
}

export const ExerciseItem: React.FC<ExerciseItemProps> = ({ exercise, index }) => {
  const { activeDay, updateExercise, removeExercise } = useWorkout();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const handleNumChange = (field: "sets" | "reps" | "weight", rawValue: string) => {
    // Keep it as a positive integer, default to 0 if empty/invalid
    const parsed = parseInt(rawValue, 10);
    const value = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    updateExercise(activeDay, exercise.id, { [field]: value });
  };

  const formattedIndex = String(index + 1).padStart(2, "0");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex flex-col gap-3 rounded border p-3 sm:p-4 transition-all duration-200 ${
        isDragging
          ? "border-ledger-accent bg-ledger-card/80 shadow-lg shadow-ledger-accent/10"
          : "border-ledger-border bg-ledger-card hover:border-ledger-border/80 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left: Drag Handle, Index, and Name */}
        <div className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0">
          {/* Drag Handle button */}
          <button
            type="button"
            className="cursor-grab text-ledger-muted/40 hover:text-ledger-accent active:cursor-grabbing p-1 transition-colors duration-150"
            title="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4.5 w-4.5" />
          </button>

          {/* Ledger-style Index */}
          <span className="font-mono text-sm font-bold tracking-tight text-ledger-accent/70 select-none">
            {formattedIndex}.
          </span>

          {/* Inline Editable Name Input */}
          <input
            type="text"
            value={exercise.name}
            onChange={(e) => updateExercise(activeDay, exercise.id, { name: e.target.value })}
            placeholder="Exercise Name"
            className="flex-1 min-w-0 bg-transparent py-0.5 px-1 text-sm font-semibold text-ledger-text border-b border-transparent hover:border-ledger-border focus:border-ledger-accent focus:outline-none transition-colors duration-200"
          />
        </div>

        {/* Delete Button */}
        <button
          onClick={() => removeExercise(activeDay, exercise.id)}
          className="text-ledger-muted/50 hover:text-red-500 hover:border-red-500/20 rounded p-1.5 border border-transparent hover:bg-red-500/5 transition-all duration-200 cursor-pointer"
          title="Remove exercise"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Grid of editable Numeric stats: Sets, Reps, Weight */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-ledger-bg/40 rounded p-2 border border-ledger-border/40">
        {/* Sets */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[9px] font-bold tracking-widest text-ledger-muted uppercase text-center sm:text-left">
            Sets
          </label>
          <div className="flex items-center justify-center sm:justify-start gap-1">
            <input
              type="number"
              min="0"
              value={exercise.sets === 0 ? "" : exercise.sets}
              onChange={(e) => handleNumChange("sets", e.target.value)}
              placeholder="0"
              className="w-full text-center sm:text-left bg-transparent font-mono text-sm font-bold text-ledger-text border-b border-transparent focus:border-ledger-accent focus:outline-none focus:bg-ledger-bg/20 py-0.5 px-1 transition-all"
            />
          </div>
        </div>

        {/* Reps */}
        <div className="flex flex-col gap-1 border-l border-ledger-border/50 pl-2">
          <label className="font-mono text-[9px] font-bold tracking-widest text-ledger-muted uppercase text-center sm:text-left">
            Reps
          </label>
          <div className="flex items-center justify-center sm:justify-start gap-1">
            <input
              type="number"
              min="0"
              value={exercise.reps === 0 ? "" : exercise.reps}
              onChange={(e) => handleNumChange("reps", e.target.value)}
              placeholder="0"
              className="w-full text-center sm:text-left bg-transparent font-mono text-sm font-bold text-ledger-text border-b border-transparent focus:border-ledger-accent focus:outline-none focus:bg-ledger-bg/20 py-0.5 px-1 transition-all"
            />
          </div>
        </div>

        {/* Weight */}
        <div className="flex flex-col gap-1 border-l border-ledger-border/50 pl-2">
          <label className="font-mono text-[9px] font-bold tracking-widest text-ledger-muted uppercase text-center sm:text-right">
            Weight (lbs)
          </label>
          <div className="flex items-center justify-center sm:justify-end gap-1">
            <input
              type="number"
              min="0"
              value={exercise.weight === 0 ? "" : exercise.weight}
              onChange={(e) => handleNumChange("weight", e.target.value)}
              placeholder="0"
              className="w-full text-center sm:text-right bg-transparent font-mono text-sm font-bold text-ledger-accent border-b border-transparent focus:border-ledger-accent focus:outline-none focus:bg-ledger-bg/20 py-0.5 px-1 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
