import React from "react";
import { useAuth } from "./context/AuthContext";
import { useWorkout } from "./context/WorkoutContext";
import { Header } from "./components/Header";
import { DayTabs } from "./components/DayTabs";
import { ExerciseItem } from "./components/ExerciseItem";
import { ExerciseLibrary } from "./components/ExerciseLibrary";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Dumbbell, PlusCircle, Sparkles, Loader2, LogIn, Lock } from "lucide-react";

const App: React.FC = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const { plan, activeDay, reorderExercises, loadingPlan } = useWorkout();

  // Sensors for Drag and Drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 0,
        distance: 5, // Requires small drag threshold to allow clicks/taps on fields
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentDayExercises = plan[activeDay] || [];
    const oldIndex = currentDayExercises.findIndex((ex) => ex.id === active.id);
    const newIndex = currentDayExercises.findIndex((ex) => ex.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(currentDayExercises, oldIndex, newIndex);
      reorderExercises(activeDay, reordered);
    }
  };

  const activeExercises = plan[activeDay] || [];

  // 1. Initial Authentication Loading State
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ledger-bg text-ledger-text">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin text-ledger-accent">
            <Loader2 className="h-12 w-12" />
          </div>
          <p className="font-heading text-xl font-bold uppercase tracking-widest text-ledger-accent">
            Iron Log
          </p>
          <p className="font-mono text-xs text-ledger-muted uppercase tracking-widest">
            Opening Ledger...
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated User — Login Screen
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col justify-between bg-ledger-bg text-ledger-text relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 ledger-grid-pattern opacity-[0.03] pointer-events-none"></div>

        {/* Floating golden/brass flare */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-ledger-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border border-ledger-border bg-ledger-card p-8 md:p-10 shadow-2xl relative z-10">
            {/* Logo */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded border border-ledger-accent/40 bg-ledger-bg text-ledger-accent mb-4">
                <Dumbbell className="h-8 w-8" />
              </div>
              <h1 className="font-heading text-4xl font-black tracking-wider text-ledger-text uppercase">
                Iron Log
              </h1>
              <p className="font-mono text-[11px] tracking-widest text-ledger-accent uppercase mt-1">
                // The Lifter's Training Ledger
              </p>
            </div>

            {/* Aesthetic statement */}
            <blockquote className="border-l-2 border-ledger-accent/30 bg-ledger-bg/30 px-4 py-3 font-mono text-xs text-ledger-muted mb-8 leading-relaxed">
              "No generic rings. No social feeds. Just sets, reps, and iron. Record your effort, secure your progress, sync your days."
            </blockquote>

            {/* Login button */}
            <button
              onClick={signInWithGoogle}
              className="flex w-full items-center justify-center gap-3 rounded bg-ledger-accent hover:bg-ledger-accent-hover text-ledger-bg font-bold py-3 px-4 shadow-lg hover:shadow-ledger-accent/20 transition-all duration-200 cursor-pointer text-sm"
            >
              <LogIn className="h-5 w-5 stroke-[2.5]" />
              <span>SIGN IN WITH GOOGLE</span>
            </button>

            {/* Security guarantee */}
            <div className="flex items-center justify-center gap-2 mt-6 font-mono text-[10px] text-ledger-muted/60">
              <Lock className="h-3.5 w-3.5" />
              <span>SECURED BY FIREBASE CLOUD DEY</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6 text-center text-[10px] font-mono text-ledger-muted/40 relative z-10 border-t border-ledger-border/20">
          <p>© {new Date().getFullYear()} IRON LOG. ALL EFFORT IS PERSISTED.</p>
        </footer>
      </div>
    );
  }

  // 3. Authenticated User — Main App Workspace
  return (
    <div className="flex min-h-screen flex-col bg-ledger-bg text-ledger-text">
      {/* Header */}
      <Header />

      {/* Day Tabs Navigation */}
      <DayTabs />

      {/* Main Workspace Layout */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Day List Column */}
          <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-ledger-border pb-3">
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-wider text-ledger-text uppercase">
                  {activeDay}'s Logbook
                </h2>
                <p className="font-mono text-[10px] text-ledger-muted uppercase mt-0.5">
                  // ORDER OF EXECUTION
                </p>
              </div>

              {/* Quick statistics readout */}
              <div className="flex gap-4 font-mono text-xs border border-ledger-border/40 bg-ledger-card/30 px-3 py-1.5 rounded">
                <div>
                  <span className="text-ledger-muted">Exercises: </span>
                  <span className="font-bold text-ledger-accent">{activeExercises.length}</span>
                </div>
                <div className="border-l border-ledger-border/40 pl-4">
                  <span className="text-ledger-muted">Sets: </span>
                  <span className="font-bold text-ledger-text">
                    {activeExercises.reduce((acc, curr) => acc + (curr.sets || 0), 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* List and Drag & Drop Context */}
            {loadingPlan ? (
              <div className="flex flex-col items-center justify-center py-20 text-ledger-muted gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-ledger-accent" />
                <p className="font-mono text-xs uppercase tracking-wider">Syncing day's ledger...</p>
              </div>
            ) : activeExercises.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={activeExercises.map((ex) => ex.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-3">
                    {activeExercises.map((ex, idx) => (
                      <ExerciseItem key={ex.id} exercise={ex} index={idx} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              /* Beautiful Empty State */
              <div className="flex flex-col items-center justify-center rounded border border-dashed border-ledger-border bg-ledger-card/20 py-16 px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-ledger-border bg-ledger-bg text-ledger-muted/60 mb-4">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-ledger-text mb-1">
                  Day is Empty
                </h3>
                <p className="text-xs text-ledger-muted max-w-md leading-relaxed mb-6">
                  No movements scheduled for {activeDay}. Select a movement from the library panel or add a custom movement to begin recording.
                </p>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-ledger-accent uppercase">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  <span>Build your standard training session</span>
                </div>
              </div>
            )}
          </section>

          {/* Add-Exercise Library Panel Column */}
          <aside className="lg:col-span-5 xl:col-span-4">
            <ExerciseLibrary />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default App;
