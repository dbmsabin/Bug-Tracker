import { useState, useEffect } from "react";
import { Bug } from "./schema";

const initialBugs: Bug[] = [
  {
    id: "1",
    title: "Login button unresponsive on mobile",
    description: "When tapping the login button on Safari iOS, nothing happens.",
    severity: "High",
    status: "Open",
    stepsToReproduce: "1. Open site on iOS Safari\n2. Navigate to /login\n3. Tap 'Log in'",
    createdAt: new Date(Date.now() - 100000000).toISOString(),
  },
  {
    id: "2",
    title: "Typo in footer",
    description: "The word 'Copyright' is spelled 'Copywrite' in the footer.",
    severity: "Low",
    status: "Resolved",
    stepsToReproduce: "1. Scroll to the bottom of any page.",
    createdAt: new Date(Date.now() - 200000000).toISOString(),
  },
  {
    id: "3",
    title: "App crashes when uploading large image",
    description: "Uploading an image > 10MB causes the tab to crash.",
    severity: "Critical",
    status: "In Progress",
    stepsToReproduce: "1. Go to profile settings\n2. Click 'Upload Avatar'\n3. Select a 12MB image",
    createdAt: new Date(Date.now() - 50000000).toISOString(),
  },
  {
    id: "4",
    title: "Table sorting is inverted",
    description: "Clicking 'asc' sorts descending and vice versa.",
    severity: "Medium",
    status: "Open",
    stepsToReproduce: "1. Go to users table\n2. Click on 'Name' column header",
    createdAt: new Date(Date.now() - 300000000).toISOString(),
  },
  {
    id: "5",
    title: "Dark mode flash on initial load",
    description: "User sees a flash of white background before dark mode is applied.",
    severity: "Medium",
    status: "Closed",
    stepsToReproduce: "1. Set system preference to dark mode\n2. Hard refresh the page",
    createdAt: new Date(Date.now() - 400000000).toISOString(),
  }
];

export function useBugs() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("bug-tracker-data");
    if (stored) {
      try {
        setBugs(JSON.parse(stored));
      } catch (e) {
        setBugs(initialBugs);
      }
    } else {
      setBugs(initialBugs);
      localStorage.setItem("bug-tracker-data", JSON.stringify(initialBugs));
    }
  }, []);

  const saveBugs = (newBugs: Bug[]) => {
    setBugs(newBugs);
    localStorage.setItem("bug-tracker-data", JSON.stringify(newBugs));
  };

  const addBug = (bug: Bug) => saveBugs([...bugs, bug]);
  const updateBug = (updatedBug: Bug) => saveBugs(bugs.map((b) => (b.id === updatedBug.id ? updatedBug : b)));
  const deleteBug = (id: string) => saveBugs(bugs.filter((b) => b.id !== id));

  return { bugs, addBug, updateBug, deleteBug, mounted };
}
