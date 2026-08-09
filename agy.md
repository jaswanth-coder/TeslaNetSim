# Tesla.netsim - Project State Tracker

This file preserves the state of the ns-3 WiFi 7 & 8 learning project.
Whenever you say "continue", the AI agent reads this file first to resume exactly where we left off.

## 🎯 Current Goals
1. Fix CMake compilation blocking.
2. Provide a lightweight local learning dashboard server that runs only on-demand.
3. Implement an interactive **ns-3 Coding Lab** (LeetCode style) in the web dashboard.
4. Conduct chat-based code reviews and progressive tutoring sessions.

## 📂 Active Workspace File Index
* **Dashboard App:**
  - [index.html](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/aerowlan-dashboard/index.html) - Main learning layout and tab containers.
  - [style.css](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/aerowlan-dashboard/style.css) - Vibrant, modern dark-themed styling.
  - [app.js](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/aerowlan-dashboard/app.js) - Interactive states, quizzes, assignments, and Coding Lab templates.
* **Exercises (scratch/aerowlan_exercises/):**
  - [hello-ns3.cc](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/scratch/aerowlan_exercises/hello-ns3.cc) - Environment check.
  - [p2p-simulation.cc](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/scratch/aerowlan_exercises/p2p-simulation.cc) - Point-to-Point simulation.
  - [csma-simulation.cc](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/scratch/aerowlan_exercises/csma-simulation.cc) - Bus topology.
  - [simple-wifi.cc](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/scratch/aerowlan_exercises/simple-wifi.cc) - 802.11ac Wifi.
  - [wifi7-mlo.cc](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/scratch/aerowlan_exercises/wifi7-mlo.cc) - WiFi 7 Multi-Link Operation.
  - [wifi8-cosr.cc](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/scratch/aerowlan_exercises/wifi8-cosr.cc) - WiFi 8 Coordinated Spatial Reuse.

## 🛠️ Commands & Scripts
* **Start Learning Server:**
  - `./run-dashboard.sh` (or `python3 server.py`) starts the dashboard at `http://localhost:8000`.
* **Build Project:**
  - `./ns3 build` (run from the ns-3 root directory).
* **Run Exercises:**
  - `./ns3 run scratch/aerowlan_exercises/hello-ns3`
  - `./ns3 run scratch/aerowlan_exercises/p2p-simulation`
  - `./ns3 run scratch/aerowlan_exercises/csma-simulation`
  - `./ns3 run scratch/aerowlan_exercises/simple-wifi`
  - `./ns3 run scratch/aerowlan_exercises/wifi7-mlo`
  - `./ns3 run scratch/aerowlan_exercises/wifi8-cosr`

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
- **Current Module:** Module 1: ns-3 WiFi Architecture & Fundamentals.
- **Active Task:** Exercise 1 (basic-nodes) completed. Moving on to Exercise 2 (basic-p2p) on configuring a point-to-point link.
