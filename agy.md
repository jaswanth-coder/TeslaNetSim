# Tesla.netsim - Project State Tracker

This file preserves the state of the ns-3 WiFi 7 & 8 learning project.
Whenever you say "continue", the AI agent reads this file first to resume exactly where we left off.

## 🎯 Current Goals
1. Provide a lightweight local learning dashboard server that compiles and runs code on-demand.
2. Maintain an interactive **ns-3 Coding Lab** (LeetCode style) with headers-only templates, hints, and locked solutions.
3. Allow Obsidian-style WikiLinks (`[[Term]]`) linking terms to inline popups.
4. Support clean dual Obsidian Dark and GitHub Pages Light themes with a sidebar toggler.
5. Renumber general ns-3 modules to start from Module 1.

## 📂 Active Workspace File Index
* **Dashboard App:**
  - [index.html](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/aerowlan-dashboard/index.html) - Navigation, theme switch icon, console element, and glossary modals.
  - [style.css](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/aerowlan-dashboard/style.css) - Dual-theme styles, clean borders, terminal layout, and scrollable cheat sheet command rows.
  - [app.js](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/aerowlan-dashboard/app.js) - Track 1 module renumbering logic, glossary DB, WikiLinks parser, theme state management, skeletons, and locked solutions.
* **Exercises (scratch/aerowlan_exercises/):**
  - [hello-ns3.cc](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/scratch/aerowlan_exercises/hello-ns3.cc) - Environment check.
  - [p2p-simulation.cc](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/scratch/aerowlan_exercises/p2p-simulation.cc) - Point-to-Point simulation.
  - [csma-simulation.cc](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/scratch/aerowlan_exercises/csma-simulation.cc) - Bus topology.
  - [simple-wifi.cc](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/scratch/aerowlan_exercises/simple-wifi.cc) - 802.11ac Wifi.
  - [wifi7-mlo.cc](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/scratch/aerowlan_exercises/wifi7-mlo.cc) - WiFi 7 Multi-Link Operation.
  - [wifi8-cosr.cc](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/scratch/aerowlan_exercises/wifi8-cosr.cc) - WiFi 8 Coordinated Spatial Reuse.

## 🛠️ Commands & Scripts
* **Start Learning Server:**
  - `./run-dashboard.sh` starts the dashboard at `http://localhost:8000`.
* **Local Backend Compiler (server.py):**
  - Executed automatically on clicking "Compile & Run" in the Coding Lab tab.

## 📝 Coding Lab Submissions
All submissions written in the dashboard Coding Lab are saved in:
- `scratch/aerowlan_exercises/submissions/<problem_id>.cc`

### Problem Status & Submissions:
1. `basic-nodes` (Hello World & Node Creation) - **Completed** ✅
2. `basic-p2p` (Point-to-Point Link) - *Not Started*
3. `intermediate-csma` (Multi-Node Bus) - *Not Started*
4. `intermediate-wifi` (802.11n Channel) - *Not Started*
5. `advanced-mlo` (WiFi 7 Multi-Link Setup) - *Not Started*
6. `pro-cosr` (WiFi 8 Spatial Reuse OBSS) - *Not Started*

## 🧑‍🏫 Tutoring Status
- **Current Module:** Track 1 • Module 1: Getting Started (renumbered from Module 4).
- **Active Task:** Syllabus refactored with a full step-by-step walkthrough of a basic ns-3 program (`first.cc`). Programming assignment C++ template file created in `scratch/aerowlan_exercises/module1_assignment.cc`. Isolated all terminal commands into standalone containers.
- **Git Push Status:** All updates (lessons, syntax fix, starter code, state files) committed and pushed to remote branch.
