# Tesla.netsim

```text
================================================================================
 _____           _             _      _   _     
|_   _|__  ___  | | __ _  _ __| | ___| |_| |___ 
  | |/ _ \/ __| | |/ _` |/ __|| |/ _ \  _| / __|
  | |  __/\__ \ | | (_| | (__ | |  __/ |_| \__ \
  |_|\___||___/ |_|\__,_|\___||_|\___|\__|_|___/
                                                
     Multi-Agent WLAN & WiFi 7/8 Research Assistant for ns-3.45
================================================================================
```

Welcome to **Tesla.netsim**, a multi-agent developer assistant and interactive learning hub designed for IEEE 802.11be (WiFi 7) and 802.11bn (WiFi 8 UHR candidate) research in **ns-3.45**. 

This package runs locally inside your ns-3 workspace using the **Antigravity Agentic Coding framework**, helping you build, debug, and understand wireless simulation models dynamically.

---

## 🌟 Features

* **Multi-Agent Workspace Helpers**: AI agents that specialize in writing C++ WiFi simulations, configuring NetAnim visualizer files, drafting documentation, and providing step-by-step concepts.
* **Interactive Local Dashboard**: A beautiful, premium single-page web app styled in ns-3 colors (dark slate blue and orange) to read lessons, solve module quizzes, and verify programming exercises.
* **5-Question Module Quizzes**: Test your knowledge at the end of each module with varying levels of multiple-choice assessments.
* **Auto-Grading Practical Assignments**: Write your code in your terminal, run the simulation, and paste the stdout logs directly into the dashboard. The client-side auto-grader will verify your logs and unlock the next module!
* **Two Learning Tracks**:
  * **Track 1: ns-3 Master Class (General & Wired)**: Aligns exactly with the official ns-3 tutorial chapters 4 through 10.
  * **Track 2: WiFi 7/8 Research Pro**: Dedicated to advanced wireless stack modeling, EDCA QoS queuing, WiFi 7 MLO (Multi-Link Operation), and WiFi 8 coordinated basic service set scheduling (CoSR, CoBF).

---

## 🏗️ Project Architecture

All customizations reside in the `.agents/` folder, making it fully portable and git-ready:

```text
.agents/
├── AGENTS.md               # Core system rules, coding guidelines, and workflows
├── welcome.sh              # Bash script to start the local server and launch browser
└── skills/
    ├── wlan-cpp-coder       # Automated writing and testing of C++ WiFi simulations
    ├── wlan-teaching-expert # Interactive concept lectures and conceptual explanations
    ├── wlan-netanim-visualizer # NetAnim configuration, coloring, and trace setups
    └── wlan-markdown-documenter # Git-ready READMEs, comparisons, and markdown reports
```

---

## 🚀 Getting Started

### 1. Launch the Portal
Run the welcome helper in your terminal from the workspace root to check the server status and automatically open the dashboard:
```bash
bash .agents/welcome.sh
```

Alternatively, you can start the static web server manually:
```bash
python3 -m http.server 8080 --directory aerowlan-dashboard
```
Then navigate to: **[http://localhost:8080](http://localhost:8080)** in your web browser.

### 2. Configure & Build ns-3
Run the standard CMake configuration and compilation commands:
```bash
# Configure the build profile
./ns3 configure --enable-examples --enable-tests --build-profile=debug

# Compile modules
./ns3 build
```

### 3. Practice Environments
All simulation exercise files are located under:
`scratch/aerowlan_exercises/`

To run any module's practice code:
```bash
./ns3 run scratch/aerowlan_exercises/<exercise-name>
```

---

## 🤖 Dynamic Code Verification

When doing programming assignments:
1. Modify the target script (e.g. [`simple-wifi.cc`](./scratch/aerowlan_exercises/simple-wifi.cc)).
2. Compile and run, redirecting stdout to a verification log:
   ```bash
   ./ns3 run scratch/aerowlan_exercises/simple-wifi > scratch/aerowlan_exercises/module7_output.txt 2>&1
   ```
3. Copy the contents of `module7_output.txt` and paste it into the **Practical Programming Assignment** text area on the dashboard to verify and unlock the next module!
4. If you run into build errors or logical bugs, simply ask your Antigravity agent in the chat: *"Please check my Module 7 code and output"* and the agent will help debug the workspace files for you.

---

## 🛣️ Future Roadmap & Contributions

We are actively expanding Tesla.netsim to support:
- [ ] Automated validation of PCAP trace metrics using Python scripts.
- [ ] Integration with Gnuplot tracing to show dynamic throughput curves in the dashboard.
- [ ] Custom class templates for Coordinated Spatial Reuse (CoSR) schedulers.
- [ ] Machine learning interfaces (e.g. ns3-gym integration).

We welcome features, issues, and pull requests to expand the agentic helper module!

---

## ⭐ Leave a Star

If you find this agentic WLAN helper, learning guide, or local dashboard useful for your wireless network simulations or academic research, **please leave a star on this repository!**

*Created by jaswanth-coder in collaboration with the Google Deepmind Antigravity Agent.*
