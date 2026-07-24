import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { EXERCISE_LIBRARY } from "../data/exerciseLibrary";
import { DayTabs } from "../components/DayTabs";

// Mock the WorkoutContext for the rendering test
vi.mock("../context/WorkoutContext", () => {
  return {
    DAYS_OF_WEEK: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    useWorkout: () => ({
      activeDay: "Mon",
      setActiveDay: vi.fn(),
      plan: {
        Mon: [{ id: "1", name: "Bench Press", sets: 3, reps: 10, weight: 135 }],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: [],
      },
    }),
  };
});

describe("Exercise Library Data Shape", () => {
  test("should contain the required categories", () => {
    const requiredCategories = ["Push", "Pull", "Legs", "Core", "Cardio"];
    expect(Object.keys(EXERCISE_LIBRARY)).toEqual(
      expect.arrayContaining(requiredCategories)
    );
  });

  test("each category should be an array of string exercise names", () => {
    Object.entries(EXERCISE_LIBRARY).forEach(([_, exercises]) => {
      expect(Array.isArray(exercises)).toBe(true);
      expect(exercises.length).toBeGreaterThan(0);
      exercises.forEach((exercise) => {
        expect(typeof exercise).toBe("string");
        expect(exercise.trim().length).toBeGreaterThan(0);
      });
    });
  });
});

describe("DayTabs Component", () => {
  test("renders all 7 day tabs", () => {
    render(<DayTabs />);
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
  });

  test("displays the correct count of exercises under day tabs", () => {
    render(<DayTabs />);
    // "Mon" has 1 exercise in the mock, others have 0
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
