// Tesla.netsim App Logic

// Navigation Tab Management
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    const tabId = this.getAttribute('data-tab');
    switchTab(tabId);
  });
});

function switchTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  document.querySelector(`.nav-item[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(`${tabId}-tab`).classList.add('active');
}

// Track and Course States
let currentTrackIndex = 0; // 0 = ns-3 Master Class, 1 = WiFi 7/8 Research Pro
let currentModuleIndex = 0;
let currentLessonIndex = 0;
let currentQuizQuestionIndex = 0;
let quizAnswersCorrect = 0;
let expandedModules = {};

let progress = JSON.parse(localStorage.getItem('tesla_netsim_progress')) || {
  completedLessons: [] // Array of completed IDs: e.g. "T1-M4-Q", "T1-M4-A"
};

// Course Tracks Data Structure - Detailed matching the PDF index
const tracks = [
  {
    name: "Track 1: ns-3 Master Class (General & Wired)",
    modules: [
      {
        id: 1,
        title: "Module 1: Getting Started",
        description: "Core architectures, memory tracking, first.cc walk-through, build configuration profiles, and command line setups.",
        lessons: [
          {
            id: "T1-M1-L1",
            title: "1.1 ns-3 Architecture & Memory Abstractions",
            moduleTitle: "Track 1 • Module 1 • Lesson 1",
            body: `
              <p>Welcome to ns-3! The <strong>ns-3 simulator</strong> is a discrete-event network simulator written in C++ and optimized for academic and industrial research.</p>
              <h4>1.1.1 Directory Structure & Workspace Layout</h4>
              <p>When you look inside the root directory <code>/home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45</code>, you will find:</p>
              <ul>
                <li><code>src/</code>: Contains the source code for all core simulator modules. Each folder inside (like <code>core</code>, <code>network</code>, <code>internet</code>, <code>wifi</code>) is compiled as a separate shared library.</li>
                <li><code>examples/</code>: Contains standard pre-written simulations demonstrating various protocols.</li>
                <li><code>scratch/</code>: The playground. Any C++ script placed here with a <code>main()</code> function is dynamically compiled as an executable target by the build system.</li>
              </ul>
              <h4>1.1.2 Memory Management & smart pointers ([[NodeContainer]])</h4>
              <p>C++ is notorious for memory leaks. To prevent leaks, ns-3 employs a custom reference-counting system. Rather than raw pointers, objects are managed using the smart pointer template <code>Ptr&lt;T&gt;</code>.</p>
              <p>When you create a node in ns-3, you do not write <code>Node* node = new Node()</code>. Instead, you write:</p>
              <pre><code>Ptr<Node> node = CreateObject<Node> ();</code></pre>
              <p>The class [[NodeContainer]] is a helper that wraps an array of <code>Ptr&lt;Node&gt;</code> pointers, making it easy to create and manage multiple hosts simultaneously.</p>
              
              <div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; padding: 12px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                <strong style="color: #a5b4fc; display: block; margin-bottom: 6px;">💡 Layman's Analogy:</strong>
                Think of an ns-3 [[Node]] like a brand-new computer tower out of the box. It has no operating system, no applications, and no network card installed yet. Smart pointers (<code>Ptr&lt;T&gt;</code>) are like automated trash collectors that track who is holding a toy; when no one is playing with it anymore, the toy is automatically recycled to keep the room clean.
              </div>
            `
          },
          {
            id: "T1-M1-L2",
            title: "1.2 Anatomy of a Basic Simulation Script (first.cc)",
            moduleTitle: "Track 1 • Module 1 • Lesson 2",
            body: `
              <p>Here is a complete, fully functional C++ simulation code representing the standard <code>first.cc</code> from the ns-3 tutorial, which sets up a point-to-point link between two nodes. Let's study the code:</p>
              
              <div class="topology-diagram" style="display: flex; align-items: center; justify-content: center; gap: 16px; margin: 20px 0; padding: 20px; background: rgba(15, 23, 42, 0.6); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <div style="width: 48px; height: 48px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; border: 2px solid #60a5fa; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);">Node 0</div>
                  <span style="font-size: 11px; margin-top: 6px; color: #94a3b8;">Sender</span>
                </div>
                <div style="flex-grow: 1; height: 4px; background: #64748b; position: relative; max-width: 150px; min-width: 80px;">
                  <span style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 11px; color: #a5b4fc; white-space: nowrap; font-weight: 500;">P2P Channel</span>
                  <span style="position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 10px; color: #94a3b8; white-space: nowrap;">5Mbps / 2ms</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <div style="width: 48px; height: 48px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; border: 2px solid #34d399; box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);">Node 1</div>
                  <span style="font-size: 11px; margin-top: 6px; color: #94a3b8;">Receiver</span>
                </div>
              </div>

              <pre><code>#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include &lt;iostream&gt;
 
using namespace ns3;
 
NS_LOG_COMPONENT_DEFINE ("AeroWlanHelloP2p");
 
int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);
 
  NodeContainer nodes;
  nodes.Create (2);
 
  PointToPointHelper pointToPoint;
  pointToPoint.SetDeviceAttribute ("DataRate", StringValue ("5Mbps"));
  pointToPoint.SetChannelAttribute ("Delay", StringValue ("2ms"));
 
  NetDeviceContainer devices;
  devices = pointToPoint.Install (nodes);
 
  std::cout &lt;&lt; "Simulation topology built successfully!" &lt;&lt; std::endl;
  return 0;
}</code></pre>
              <h4>Detailed Architectural Walkthrough:</h4>
              <ol style="padding-left:18px; margin-top:10px;">
                <li style="margin-bottom:10px;"><strong>Headers (Lines 1-4)</strong>:
                  <ul>
                    <li><code>#include "ns3/core-module.h"</code>: Resolves compiler dependencies for foundational utilities like timers, event schedulers, logging streams, and shell commands.</li>
                    <li><code>#include "ns3/network-module.h"</code>: Contains basic data structures that represent network packets, node hardware interfaces, and collection helpers like [[NodeContainer]].</li>
                    <li><code>#include "ns3/point-to-point-module.h"</code>: Provides classes representing physical ethernet cables and simple point-to-point physical transmission links.</li>
                  </ul>
                </li>
                <li style="margin-bottom:10px;"><strong>The ns3 Namespace (Line 6)</strong>:
                  <ul>
                    <li>All ns-3 components are scoped under the <code>ns3</code> namespace. This isolates the simulator classes from other standard C++ or third-party libraries (like standard <code>std::</code> structures) to avoid name clashes.</li>
                  </ul>
                </li>
                <li style="margin-bottom:10px;"><strong>Logging Identifiers (Line 8)</strong>:
                  <ul>
                    <li><code>NS_LOG_COMPONENT_DEFINE ("AeroWlanHelloP2p");</code>: Registers a unique console log module. By registering this identifier, you can filter and enable/disable console outputs from this specific script dynamically at runtime via the environment variable <code>NS_LOG</code>.</li>
                  </ul>
                </li>
                <li style="margin-bottom:10px;"><strong>Main loop & Parameter Parsing (Lines 10-14)</strong>:
                  <ul>
                    <li>The simulator execution starts in the standard C++ <code>main()</code>. The <code>CommandLine cmd</code> object binds to your shell terminal interface, allowing you to pass variables to the simulator when running it in the shell, bypassing hardcoded re-compilation.</li>
                  </ul>
                </li>
                <li style="margin-bottom:10px;"><strong>Node Containers (Lines 16-17)</strong>:
                  <ul>
                    <li><code>NodeContainer nodes; nodes.Create(2);</code>: Creates the logical nodes (hosts) inside the system. Under the hood, this instantiates two <code>Node</code> objects, tracks them using C++ smart pointers, and registers their metadata with the system scheduler.</li>
                  </ul>
                </li>
                <li style="margin-bottom:10px;"><strong>Helper Abstractions (Lines 19-21)</strong>:
                  <ul>
                    <li>Configuring network hardware is complex. The helper class <code>[[PointToPointHelper]]</code> hides the complexity of manually creating a <code>PointToPointNetDevice</code> and a <code>PointToPointChannel</code>.</li>
                    <li><code>SetDeviceAttribute ("DataRate", ...)</code> maps directly to the link speed of the simulated NIC (Network Interface Card).</li>
                    <li><code>SetChannelAttribute ("Delay", ...)</code> dictates the propagation speed of signals traversing the virtual cable (transmission medium delay).</li>
                  </ul>
                </li>
                <li style="margin-bottom:10px;"><strong>Device Installation (Lines 23-24)</strong>:
                  <ul>
                    <li><code>pointToPoint.Install (nodes)</code>: Tells the helper to loop through your nodes, instantiate two simulated network interface cards, connect them with a channel model, and return their references inside a <code>NetDeviceContainer</code>.</li>
                  </ul>
                </li>
              </ol>
            `
          },
          {
            id: "T1-M1-L3",
            title: "1.3 Build Systems & Compilation Configuration",
            moduleTitle: "Track 1 • Module 1 • Lesson 3",
            body: `
              <p>ns-3 uses **CMake** to configure and build. To compile targets, we use the custom python orchestration script <code>./ns3</code> in the root directory.</p>
              <h4>1.3.1 Configuration Profiles</h4>
              <p>Before compiling, you must configure the project. There are two primary profiles:</p>
              <ol style="padding-left: 18px;">
                <li style="margin-bottom: 8px;"><strong>Debug Profile</strong>: Configured using <code>--build-profile=debug</code>. It enables debugging symbols and, crucially, **runtime assertions** (tests that crash the simulator early if configuration parameters are illegal).</li>
                <li style="margin-bottom: 8px;"><strong>Optimized Profile</strong>: Configured using <code>--build-profile=optimized</code>. It strips debug info and enables compiler optimization flags (<code>-O3</code>). Crucial for running massive simulation sweeps which execute 5x to 10x faster.</li>
              </ol>
              <p>Example configuration command:</p>
              <pre><code>./ns3 configure --enable-examples --enable-tests --build-profile=debug</code></pre>
              <h4>1.3.2 The CMake Build Process</h4>
              <p>Once configured, compile the targets using the build script:</p>
              <pre><code>./ns3 build</code></pre>
              <p>Incremental compilation means if you modify a file in <code>scratch/</code>, only your script is compiled, taking ~2 seconds. However, if you modify a core header in <code>src/wifi/</code>, CMake must recompile the entire <code>wifi</code> module and all dependent modules, which can take several minutes.</p>
            `
          },
          {
            id: "T1-M1-Q",
            title: "Module 1 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 1 • Module 1 • Assessment",
            quiz: [
              {
                question: "1. Why does ns-3 use the Ptr<T> smart pointer template instead of raw pointers?",
                options: [
                  { text: "It is required by C++ compiler standards", isCorrect: false },
                  { text: "To implement reference counting and automatically manage memory cleanup", isCorrect: true },
                  { text: "To speed up compilation times in CMake", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Ptr<T> manages reference counting, ensuring memory is automatically freed when no references remain.",
                feedbackError: "Incorrect. Ptr<T> is for reference counting and automatic memory cleanup. Try again!"
              },
              {
                question: "2. When running a massive, heavy simulation sweep, which build configuration profile should be used?",
                options: [
                  { text: "Debug profile (--build-profile=debug)", isCorrect: false },
                  { text: "Optimized profile (--build-profile=optimized)", isCorrect: true },
                  { text: "Static profile (--enable-static)", isCorrect: false }
                ],
                feedbackSuccess: "Correct! The optimized profile removes debug symbols and enables compiler optimizations, running up to 10x faster.",
                feedbackError: "Incorrect. The optimized profile is designed for high-performance execution. Try again!"
              },
              {
                question: "3. What is the purpose of calling Simulator::Destroy() at the end of a C++ script?",
                options: [
                  { text: "To delete the executable from the scratch directory", isCorrect: false },
                  { text: "To clean up and deallocate all scheduled events and reference-counted objects", isCorrect: true },
                  { text: "To print the final simulation results to the console", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Simulator::Destroy() triggers cleanup to prevent memory leaks at execution end.",
                feedbackError: "Incorrect. Simulator::Destroy() clears the events queue and deallocates memory. Try again!"
              }
            ]
          },
          {
            id: "T1-M1-A",
            title: "Module 1 Programming Assignment",
            isAssignmentOnly: true,
            moduleTitle: "Track 1 • Module 1 • Assignment",
            assignmentInstructions: `
              <h4>Assignment Objective:</h4>
              <p>Write and build a custom ns-3 script that dynamically parses command-line arguments to instantiate a variable number of nodes.</p>
              
              <h4>Instructions:</h4>
              <p>Create the new assignment source file in your scratch exercises directory:</p>
              <div class="assignment-cmd-container">
                <div class="assignment-cmd-label">Create File Path</div>
                <div class="assignment-cmd-box">
                  <code>scratch/aerowlan_exercises/module1_assignment.cc</code>
                  <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('scratch/aerowlan_exercises/module1_assignment.cc')">Copy Path</button>
                </div>
              </div>

              <p>Write a standard ns-3 program inside it containing the following components:</p>
              <ul style="padding-left: 18px; margin-top: 8px; margin-bottom: 8px;">
                <li>Include <code>"ns3/core-module.h"</code> and <code>"ns3/network-module.h"</code>.</li>
                <li>Declare a logging component name: <code>NS_LOG_COMPONENT_DEFINE ("AeroWlanModule1");</code></li>
                <li>Initialize a variable: <code>uint32_t nodeCount = 3;</code></li>
                <li>Use the <code>CommandLine</code> helper to add a value parameter named <code>"nodeCount"</code> to override that variable at runtime.</li>
                <li>Parse the command-line arguments.</li>
                <li>Instantiate a [[NodeContainer]] and create the specified <code>nodeCount</code> nodes.</li>
                <li>Print exactly: <code>Successfully created X nodes.</code> to the standard console output (where X is the number of nodes).</li>
                <li>Safely run and call <code>Simulator::Destroy();</code> before exiting.</li>
              </ul>
              
              <h4>Step 1: Build the assignment target</h4>
              <p>Verify that your C++ file compiles correctly in your terminal:</p>
              <div class="assignment-cmd-container">
                <div class="assignment-cmd-label">Compile Project</div>
                <div class="assignment-cmd-box">
                  <code>./ns3 build</code>
                  <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('./ns3 build')">Copy</button>
                </div>
              </div>
              
              <h4>Step 2: Run the simulation with custom arguments</h4>
              <p>Execute the program and pass <code>--nodeCount=6</code> to verify command line parsing works. Redirect the output to the output file:</p>
              <div class="assignment-cmd-container">
                <div class="assignment-cmd-label">Run Simulation</div>
                <div class="assignment-cmd-box">
                  <code>./ns3 run "scratch/aerowlan_exercises/module1_assignment --nodeCount=6" > scratch/aerowlan_exercises/module1_output.txt 2>&1</code>
                  <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('./ns3 run \&quot;scratch/aerowlan_exercises/module1_assignment --nodeCount=6\&quot; > scratch/aerowlan_exercises/module1_output.txt 2>&1')">Copy</button>
                </div>
              </div>
              
              <h4>Step 3: Submit logs for verification</h4>
              <p>Open the generated text file, copy its content, and paste it into the submission paste area below to submit:</p>
              <div class="assignment-cmd-container">
                <div class="assignment-cmd-label">Verification Output File</div>
                <div class="assignment-cmd-box">
                  <code>scratch/aerowlan_exercises/module1_output.txt</code>
                  <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('scratch/aerowlan_exercises/module1_output.txt')">Copy Path</button>
                </div>
              </div>
            `,
            assignmentVerifyKeyword: "Successfully created 6 nodes.",
            practiceFile: "scratch/aerowlan_exercises/module1_assignment.cc"
          }
        ]
      },
      {
        id: 5,
        title: "Module 2: Conceptual Overview",
        description: "Network abstractions, internet stacks, IPv4 address helpers, and UDP Echo applications.",
        lessons: [
          {
            id: "T1-M2-L1",
            title: "2.1 Key Abstractions: Nodes, Devices, and Channels",
            moduleTitle: "Track 1 • Module 2 • Lesson 1",
            body: `
              <p>In ns-3, virtual network topologies are constructed by tying together three primary C++ abstractions: Nodes, NetDevices, and Channels.</p>
              <h4>2.1.1 Logical Hosts ([[Node]])</h4>
              <p>A [[Node]] represents a physical computing system or network node (such as a router, mobile terminal, or access point). Crucially, a Node starts as a "blank slate." It has no network card interfaces, no operating system protocols, and no applications. You must explicitly configure and install these layers onto the node.</p>
              <h4>2.1.2 Network Interfaces ([[NetDevice]])</h4>
              <p>A [[NetDevice]] represents a Network Interface Card (NIC) and its driver (e.g. Ethernet card, WiFi antenna). A Node can contain multiple NetDevices to connect to different networks. The NetDevice handles link-layer frame framing, MAC address resolution, and physical packet queue management.</p>
              <h4>2.1.3 Physical Media ([[Channel]])</h4>
              <p>A [[Channel]] represents the physical transmission medium connecting hosts (e.g. copper wires, fiber optics, or open air). NetDevices must attach to a Channel to transmit signals. Wired media are represented by classes like <code>PointToPointChannel</code> or <code>CsmaChannel</code>, whereas wireless media use <code>YansWifiChannel</code>.</p>
              
              <div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; padding: 12px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                <strong style="color: #a5b4fc; display: block; margin-bottom: 6px;">💡 Layman's Analogy:</strong>
                An ns-3 simulation is like a theatrical play. [[Node]]s are the actors. [[NetDevice]]s are the actors' roles, costumes, and scripts. [[Channel]]s are the stages and acoustic rooms they speak in. Sockets and protocols are the languages they use. Without a stage, actors cannot project their voices. Without a common language, they cannot understand each other.
              </div>
            `
          },
          {
            id: "T1-M2-L2",
            title: "2.2 The TCP/IP Internet Stack & Subnet Routing",
            moduleTitle: "Track 1 • Module 2 • Lesson 2",
            body: `
              <p>Once nodes and devices are physically linked, you must enable transport layers and logical IP addresses to orchestrate end-to-end packet delivery.</p>
              <h4>2.2.1 Installing Protocols ([[InternetStackHelper]])</h4>
              <p>The helper class <code>[[InternetStackHelper]]</code> installs the IP stack, routing engines (such as static routing or OSPF), and transport layer sockets (TCP, UDP) onto your NodeContainer:</p>
              <pre><code>InternetStackHelper stack;\nstack.Install (nodes);</code></pre>
              <h4>2.2.2 Assigning IP Subnets ([[Ipv4AddressHelper]])</h4>
              <p>To assign IP addresses, we use the helper <code>[[Ipv4AddressHelper]]</code>. You define the network address base and the subnet mask, then allocate them to your interfaces container:</p>
              <pre><code>Ipv4AddressHelper address;\naddress.SetBase ("10.1.1.0", "255.255.255.0");\nIpv4InterfaceContainer interfaces = address.Assign (devices);</code></pre>
              <p>This assigns sequential IPs (e.g., <code>10.1.1.1</code> to Node 0, <code>10.1.1.2</code> to Node 1) to each net device dynamically.</p>
            `
          },
          {
            id: "T1-M2-L3",
            title: "2.3 Echo Applications & Simulation Scheduling",
            moduleTitle: "Track 1 • Module 2 • Lesson 3",
            body: `
              <p>To generate network traffic, you install Applications onto nodes. The standard C++ test suite includes echo utilities to verify reachability.</p>
              <h4>2.3.1 UDP Echo Servers & Clients</h4>
              <p>We configure applications using helpers, which then compile and deploy executable binaries inside nodes:</p>
              <ul>
                <li><code>UdpEchoServerHelper</code>: Binds to a port (e.g. 9) on the receiving host. It listens for incoming packets and bounces them back.</li>
                <li><code>UdpEchoClientHelper</code>: Deploys on the sending host. It takes the server's IP address and port as arguments and generates packets of a specified size and frequency.</li>
              </ul>
              <h4>2.3.2 Timeline Execution and Simulator Timers</h4>
              <p>Every Application must be configured with specific start and stop timers to schedule events in the event loop queue:</p>
              <pre><code>clientApps.Start (Seconds (1.0));\nclientApps.Stop (Seconds (10.0));</code></pre>
              <p>When the simulation starts, the scheduler schedules a client application trigger event at timestamp 1.0s, and a stop event at 10.0s, bringing the event loop to a close when no events remain.</p>
            `
          },
          {
            id: "T1-M2-L4",
            title: "2.4 Walkthrough of a Multi-Link C++ Script",
            moduleTitle: "Track 1 • Module 2 • Lesson 4",
            body: `
              <p>To help you implement the programming assignment, let's study a complete C++ script of a 2-segment network topology. This example is very similar to your assignment, but uses different link rates, delays, IP subnets, and packet configurations. Pay attention to how routing and devices are configured:</p>
              
              <div class="topology-diagram" style="display: flex; align-items: center; justify-content: center; gap: 16px; margin: 20px 0; padding: 20px; background: rgba(15, 23, 42, 0.6); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <div style="width: 48px; height: 48px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; border: 2px solid #60a5fa; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);">N0</div>
                  <span style="font-size: 11px; margin-top: 6px; color: #94a3b8;">192.168.1.1</span>
                </div>
                <div style="flex-grow: 1; height: 4px; background: #64748b; position: relative; max-width: 120px; min-width: 60px;">
                  <span style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 10px; color: #a5b4fc; white-space: nowrap;">Subnet 192.168.1.0/24</span>
                  <span style="position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 9px; color: #94a3b8; white-space: nowrap;">P2P A (10Mbps / 5ms)</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <div style="width: 48px; height: 48px; border-radius: 50%; background: #eab308; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; border: 2px solid #fde047; box-shadow: 0 0 10px rgba(234, 179, 8, 0.5);">N1</div>
                  <span style="font-size: 10px; margin-top: 6px; color: #94a3b8; text-align: center; line-height: 1.2;">Gateway<br>192.168.1.2 / 192.168.2.1</span>
                </div>
                <div style="flex-grow: 1; height: 4px; background: #64748b; position: relative; max-width: 120px; min-width: 60px;">
                  <span style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 10px; color: #a5b4fc; white-space: nowrap;">Subnet 192.168.2.0/24</span>
                  <span style="position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 9px; color: #94a3b8; white-space: nowrap;">P2P B (10Mbps / 5ms)</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <div style="width: 48px; height: 48px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; border: 2px solid #34d399; box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);">N2</div>
                  <span style="font-size: 11px; margin-top: 6px; color: #94a3b8;">192.168.2.2 (Server)</span>
                </div>
              </div>

              <pre><code>#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include "ns3/internet-module.h"
#include &lt;iostream&gt;

using namespace ns3;

NS_LOG_COMPONENT_DEFINE ("AeroWlanMultiLinkExample");

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  // 1. Allocate nodes
  NodeContainer nodes;
  nodes.Create (3);

  NodeContainer linkANodes = NodeContainer (nodes.Get (0), nodes.Get (1));
  NodeContainer linkBNodes = NodeContainer (nodes.Get (1), nodes.Get (2));

  // 2. Configure Point-to-Point links
  PointToPointHelper p2p;
  p2p.SetDeviceAttribute ("DataRate", StringValue ("10Mbps"));
  p2p.SetChannelAttribute ("Delay", StringValue ("5ms"));

  NetDeviceContainer devicesA = p2p.Install (linkANodes);
  NetDeviceContainer devicesB = p2p.Install (linkBNodes);

  // 3. Install Internet Stack
  InternetStackHelper stack;
  stack.Install (nodes);

  // 4. Assign IP addresses to each segment
  Ipv4AddressHelper address;
  
  address.SetBase ("192.168.1.0", "255.255.255.0");
  Ipv4InterfaceContainer interfacesA = address.Assign (devicesA);

  address.SetBase ("192.168.2.0", "255.255.255.0");
  Ipv4InterfaceContainer interfacesB = address.Assign (devicesB);

  // 5. Populate Global Routing tables
  Ipv4GlobalRoutingHelper::PopulateRoutingTables ();

  // 6. Setup UDP Echo Server on Node 2
  UdpEchoServerHelper echoServer (9);
  ApplicationContainer serverApps = echoServer.Install (nodes.Get (2));
  serverApps.Start (Seconds (1.0));
  serverApps.Stop (Seconds (10.0));

  // 7. Setup UDP Echo Client on Node 0 targeting Node 2's IP address
  Ipv4Address serverIp = interfacesB.GetAddress (1); // Node 2's IP on Link B
  UdpEchoClientHelper echoClient (serverIp, 9);
  echoClient.SetAttribute ("MaxPackets", UintegerValue (3));
  echoClient.SetAttribute ("Interval", TimeValue (Seconds (1.0)));
  echoClient.SetAttribute ("PacketSize", UintegerValue (1024));

  ApplicationContainer clientApps = echoClient.Install (nodes.Get (0));
  clientApps.Start (Seconds (2.0));
  clientApps.Stop (Seconds (10.0));

  Simulator::Run ();
  Simulator::Destroy ();
  return 0;
}</code></pre>
              <h4>Key Concepts Walkthrough:</h4>
              <ol style="padding-left:18px; margin-top:10px;">
                <li style="margin-bottom:10px;"><strong>Segmenting Node Containers (Lines 18-20)</strong>:
                  <ul>
                    <li>In a multi-link wired network, helpers cannot install on the entire <code>nodes</code> container at once because point-to-point links only connect two nodes. We build sub-containers using <code>NodeContainer(nodeA, nodeB)</code> to represent specific links.</li>
                  </ul>
                </li>
                <li style="margin-bottom:10px;"><strong>Multiple Subnet Allocation (Lines 35-42)</strong>:
                  <ul>
                    <li>Each physical link represents a distinct subnet. We must call <code>SetBase</code> to redefine the network base (e.g. <code>192.168.1.0</code> vs <code>192.168.2.0</code>) before invoking <code>Assign</code>.</li>
                  </ul>
                </li>
                <li style="margin-bottom:10px;"><strong>Global Routing Tables (Line 45)</strong>:
                  <ul>
                    <li>Without routing tables, Node 0 does not know how to reach Node 2 because Node 0 is only connected to the 192.168.1.0/24 network. Calling <code>Ipv4GlobalRoutingHelper::PopulateRoutingTables()</code> commands the simulator to crawl the topology and automatically write static routing tables for every node.</li>
                  </ul>
                </li>
                <li style="margin-bottom:10px;"><strong>Targeting Server IPs (Line 54)</strong>:
                  <ul>
                    <li>We retrieve Node 2's IP address by querying <code>interfacesB</code> at index 1. Since Node 1 is index 0 on Link B, Node 2 is index 1.</li>
                  </ul>
                </li>
              </ol>
            `
          },
          {
            id: "T1-M2-Q",
            title: "Module 2 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 1 • Module 2 • Assessment",
            quiz: [
              {
                question: "1. Which ns-3 abstraction represents the physical transmission media?",
                options: [
                  { text: "Node", isCorrect: false },
                  { text: "NetDevice", isCorrect: false },
                  { text: "Channel", isCorrect: true }
                ],
                feedbackSuccess: "Correct! The Channel class models the physical communication medium.",
                feedbackError: "Incorrect. Channel is the physical medium. Try again!"
              },
              {
                question: "2. What helper class installs protocol layers (IP, TCP, UDP) onto Node objects?",
                options: [
                  { text: "InternetStackHelper", isCorrect: true },
                  { text: "Ipv4AddressHelper", isCorrect: false },
                  { text: "NetDeviceHelper", isCorrect: false }
                ],
                feedbackSuccess: "Correct! InternetStackHelper configures the network/transport stacks on your nodes.",
                feedbackError: "Incorrect. InternetStackHelper sets up transport sockets and IP routing. Try again!"
              },
              {
                question: "3. What helper is responsible for defining base IP networks and assigning subnets?",
                options: [
                  { text: "Ipv4AddressHelper", isCorrect: true },
                  { text: "InternetStackHelper", isCorrect: false },
                  { text: "NodeContainer", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Ipv4AddressHelper assigns base IPs and subnets to interfaces.",
                feedbackError: "Incorrect. Ipv4AddressHelper assigns IP addresses. Try again!"
              }
            ]
          },
          {
            id: "T1-M2-A",
            title: "Module 2 Programming Assignment",
            isAssignmentOnly: true,
            moduleTitle: "Track 1 • Module 2 • Assignment",
            assignmentInstructions: `
              <h4>Assignment Objective:</h4>
              <p>Write a multi-segment point-to-point simulation configuring global routing tables and verify packet traversal through a gateway.</p>
              
              <h4>Instructions:</h4>
              <p>Create the new assignment source file in your scratch exercises directory:</p>
              <div class="assignment-cmd-container">
                <div class="assignment-cmd-label">Create File Path</div>
                <div class="assignment-cmd-box">
                  <code>scratch/aerowlan_exercises/module2_assignment.cc</code>
                  <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('scratch/aerowlan_exercises/module2_assignment.cc')">Copy Path</button>
                </div>
              </div>

              <p>Write an ns-3 program inside it that establishes a linear topology of 3 nodes:</p>
              <ul style="padding-left: 18px; margin-top: 8px; margin-bottom: 8px;">
                <li>Create 3 nodes (Node 0, Node 1, Node 2).</li>
                <li>Connect Node 0 to Node 1 via Point-to-Point Link A (DataRate: <code>"5Mbps"</code>, Delay: <code>"2ms"</code>).</li>
                <li>Connect Node 1 to Node 2 via Point-to-Point Link B (DataRate: <code>"5Mbps"</code>, Delay: <code>"2ms"</code>).</li>
                <li>Install the Internet stack on all nodes.</li>
                <li>Assign subnet <code>"10.1.1.0/24"</code> to Link A, and subnet <code>"10.1.2.0/24"</code> to Link B.</li>
                <li>Enable global routing: <code>Ipv4GlobalRoutingHelper::PopulateRoutingTables ();</code></li>
                <li>Install a UDP echo server on Node 2 (port 9).</li>
                <li>Install a UDP echo client on Node 0 targeting Node 2's IP address (port 9, packet size: 54, max packets: 1, interval: 1s).</li>
                <li>Configure the server application to start at 1s, client to start at 2s and stop at 10s.</li>
              </ul>
              
              <h4>Step 1: Build the assignment target</h4>
              <p>Verify that your C++ file compiles correctly in your terminal:</p>
              <div class="assignment-cmd-container">
                <div class="assignment-cmd-label">Compile Project</div>
                <div class="assignment-cmd-box">
                  <code>./ns3 build</code>
                  <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('./ns3 build')">Copy</button>
                </div>
              </div>
              
              <h4>Step 2: Run the simulation and capture output</h4>
              <p>Run the simulation and redirect output to the validation file:</p>
              <div class="assignment-cmd-container">
                <div class="assignment-cmd-label">Run Simulation</div>
                <div class="assignment-cmd-box">
                  <code>./ns3 run scratch/aerowlan_exercises/module2_assignment > scratch/aerowlan_exercises/module2_output.txt 2>&1</code>
                  <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('./ns3 run scratch/aerowlan_exercises/module2_assignment > scratch/aerowlan_exercises/module2_output.txt 2>&1')">Copy</button>
                </div>
              </div>
              
              <h4>Step 3: Submit logs for verification</h4>
              <p>Open the generated text file, copy its content, and paste it into the submission paste area below to submit:</p>
              <div class="assignment-cmd-container">
                <div class="assignment-cmd-label">Verification Output File</div>
                <div class="assignment-cmd-box">
                  <code>scratch/aerowlan_exercises/module2_output.txt</code>
                  <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('scratch/aerowlan_exercises/module2_output.txt')">Copy Path</button>
                </div>
              </div>
            `,
            assignmentVerifyKeyword: "Received 54 bytes from 10.1.2.2",
            practiceFile: "scratch/aerowlan_exercises/module2_assignment.cc"
          }
        ]
      },
      {
        id: 6,
        title: "Module 3: Tweaking",
        description: "Enabling console log modules, dynamic command-line parsing, and log levels.",
        lessons: [
          {
            id: "T1-M3-L1",
            title: "3.1 The ns-3 Logging Subsystem & Levels",
            moduleTitle: "Track 1 • Module 3 • Lesson 1",
            body: `
              <p>When writing complex network simulations, using standard C++ console output (like <code>std::cout</code>) is bad practice. Printing streams is slow, cluttered, and cannot be disabled without modifying the source code. To solve this, ns-3 provides a robust, granular **Logging Subsystem**.</p>
              <h4>3.1.1 Logging Levels</h4>
              <p>The logging module offers seven levels of severity. When you configure a level, all levels of equal or higher severity are automatically enabled:</p>
              <ol style="padding-left:18px; margin-top:10px;">
                <li style="margin-bottom:8px;"><strong><code>LOG_ERROR</code></strong>: Serious error conditions that may halt simulation (highest severity).</li>
                <li style="margin-bottom:8px;"><strong><code>LOG_WARN</code></strong>: Warning messages indicating potential anomalous behavior.</li>
                <li style="margin-bottom:8px;"><strong><code>LOG_DEBUG</code></strong>: General debugging details (such as variables state change).</li>
                <li style="margin-bottom:8px;"><strong><code>LOG_INFO</code></strong>: Informational alerts (such as packet queue/dequeue, routing table changes).</li>
                <li style="margin-bottom:8px;"><strong><code>LOG_FUNCTION</code></strong>: Traces function calls. Every time a function is entered or exited, it is printed automatically (extremely useful for tracing execution flow).</li>
                <li style="margin-bottom:8px;"><strong><code>LOG_LOGIC</code></strong>: Inner logic steps inside methods.</li>
                <li style="margin-bottom:8px;"><strong><code>LOG_ALL</code></strong>: Enables all levels of logging details (lowest severity, most verbose).</li>
              </ol>
              
              <div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; padding: 12px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                <strong style="color: #a5b4fc; display: block; margin-bottom: 6px;">💡 Layman's Analogy:</strong>
                Logging in ns-3 is like a volume switch on a speaker. When it is turned all the way down (LOG_ERROR), you only hear major alerts (crashes). When it is turned all the way up (LOG_ALL), you hear every rustle, breath, and footstep (every function entry, variable check, and packet transmission).
              </div>
            `
          },
          {
            id: "T1-M3-L2",
            title: "3.2 Walkthrough of a Logging Script",
            moduleTitle: "Track 1 • Module 3 • Lesson 2",
            body: `
              <p>Let's study a complete C++ script demonstrating how to define logging components, write conditional logs, and trace function entry/exit states:</p>
              <pre><code>#include "ns3/core-module.h"
#include &lt;iostream&gt;

using namespace ns3;

NS_LOG_COMPONENT_DEFINE ("AeroWlanLoggingDemo");

void MyFunction (int value)
{
  NS_LOG_FUNCTION (value);
  NS_LOG_INFO ("Inside MyFunction with value " &lt;&lt; value);
}

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NS_LOG_INFO ("Simulation starting...");
  MyFunction (42);
  NS_LOG_INFO ("Simulation completed.");

  return 0;
}</code></pre>
              <h4>Line-by-Line Logging Breakdown:</h4>
              <ol style="padding-left:18px; margin-top:10px;">
                <li style="margin-bottom:10px;"><strong>Logging Component Registration (Line 6)</strong>:
                  <ul>
                    <li><code>NS_LOG_COMPONENT_DEFINE ("AeroWlanLoggingDemo");</code>: Registers a unique name tag for this file's logging namespace. You toggle logs for this file from the terminal by referencing this string.</li>
                  </ul>
                </li>
                <li style="margin-bottom:10px;"><strong>Function Tracing (Line 10)</strong>:
                  <ul>
                    <li><code>NS_LOG_FUNCTION (value);</code>: When this function is called, ns-3 automatically prints its parameters (e.g. <code>MyFunction(42)</code>). This acts as a dynamic call trace.</li>
                  </ul>
                </li>
                <li style="margin-bottom:10px;"><strong>Conditional Logs (Lines 11, 19, 21)</strong>:
                  <ul>
                    <li><code>NS_LOG_INFO ("...");</code>: Logs descriptive details. Unlike <code>std::cout</code>, these lines are completely silenced in optimized build profiles, preserving peak execution performance.</li>
                  </ul>
                </li>
              </ol>
            `
          },
          {
            id: "T1-M3-L3",
            title: "3.3 Dynamic CommandLine Arguments",
            moduleTitle: "Track 1 • Module 3 • Lesson 3",
            body: `
              <p>Rather than recompiling the simulator to tweak variables (like packet size, link bandwidth, or node counts), you register variables inside the <code>CommandLine</code> helper.</p>
              <h4>3.3.1 Binding Variables in C++</h4>
              <p>To expose a variable to the command-line interface, bind it using <code>AddValue</code> before parsing:</p>
              <pre><code>uint32_t packetSize = 128;\nCommandLine cmd (__FILE__);\ncmd.AddValue ("packetSize", "Size of packet in bytes", packetSize);\ncmd.Parse (argc, argv);</code></pre>
              <h4>3.3.2 Execution Syntax</h4>
              <p>You override these registered variables from the command line by adding parameters after a double-dash (<code>--</code>):</p>
              <pre><code>./ns3 run "scratch/my-simulation --packetSize=512"</code></pre>
            `
          },
          {
            id: "T1-M3-Q",
            title: "Module 3 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 1 • Module 3 • Assessment",
            quiz: [
              {
                question: "1. Which macro is placed at the top of a file to register its logging component name?",
                options: [
                  { text: "NS_LOG_COMPONENT_DEFINE", isCorrect: true },
                  { text: "NS_LOG_REGISTER", isCorrect: false },
                  { text: "NS_LOG_INFO", isCorrect: false }
                ],
                feedbackSuccess: "Correct! NS_LOG_COMPONENT_DEFINE defines the component name for terminal filter reference.",
                feedbackError: "Incorrect. The correct macro is NS_LOG_COMPONENT_DEFINE. Try again!"
              },
              {
                question: "2. Which macro traces function entry states and print parameters automatically?",
                options: [
                  { text: "NS_LOG_INFO", isCorrect: false },
                  { text: "NS_LOG_FUNCTION", isCorrect: true },
                  { text: "NS_LOG_LOGIC", isCorrect: false }
                ],
                feedbackSuccess: "Correct! NS_LOG_FUNCTION automatically formats and logs function call signatures.",
                feedbackError: "Incorrect. NS_LOG_FUNCTION is designed to log function traces. Try again!"
              },
              {
                question: "3. What environment variable is used to filter and enable log levels from your terminal shell?",
                options: [
                  { text: "NS_LOG", isCorrect: true },
                  { text: "NS_DEBUG", isCorrect: false },
                  { text: "NS_LEVEL", isCorrect: false }
                ],
                feedbackSuccess: "Correct! The NS_LOG env variable maps component names to target levels.",
                feedbackError: "Incorrect. You configure console output details using the NS_LOG variable. Try again!"
              }
            ]
          },
          {
            id: "T1-M3-A",
            title: "Module 3 Programming Assignment",
            isAssignmentOnly: true,
            moduleTitle: "Track 1 • Module 3 • Assignment",
            assignmentInstructions: `
              <h4>Assignment Objective:</h4>
              <p>Write an ns-3 script that integrates command-line arguments and conditional information logs, then execute it with logs enabled in your terminal shell.</p>
              
              <h4>Instructions:</h4>
              <p>Create the new assignment source file in your scratch exercises directory:</p>
              <div class="assignment-cmd-container">
                <div class="assignment-cmd-label">Create File Path</div>
                <div class="assignment-cmd-box">
                  <code>scratch/aerowlan_exercises/module3_assignment.cc</code>
                  <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('scratch/aerowlan_exercises/module3_assignment.cc')">Copy Path</button>
                </div>
              </div>

              <p>Write an ns-3 program inside it containing the following components:</p>
              <ul style="padding-left: 18px; margin-top: 8px; margin-bottom: 8px;">
                <li>Include <code>"ns3/core-module.h"</code>.</li>
                <li>Define the logging component name: <code>"AeroWlanModule3"</code>.</li>
                <li>In <code>main()</code>, declare a variable: <code>uint32_t packetSize = 128;</code></li>
                <li>Use the <code>CommandLine</code> helper to expose the argument <code>"packetSize"</code>.</li>
                <li>Parse command-line parameters.</li>
                <li>Write a log statement using <code>NS_LOG_INFO</code> that prints exactly: <code>Simulation starting with packetSize: X</code> (where X is the variable value).</li>
              </ul>
              
              <h4>Step 1: Build the assignment target</h4>
              <p>Verify that your C++ file compiles correctly in your terminal:</p>
              <div class="assignment-cmd-container">
                <div class="assignment-cmd-label">Compile Project</div>
                <div class="assignment-cmd-box">
                  <code>./ns3 build</code>
                  <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('./ns3 build')">Copy</button>
                </div>
              </div>
              
              <h4>Step 2: Enable logs in your shell and run simulation</h4>
              <p>Export the logging variable and run the simulation passing 512 bytes as packet size. Redirect the output to the validation file:</p>
              <div class="assignment-cmd-container">
                <div class="assignment-cmd-label">Run Simulation</div>
                <div class="assignment-cmd-box">
                  <code>export NS_LOG="AeroWlanModule3=info" && ./ns3 run "scratch/aerowlan_exercises/module3_assignment --packetSize=512" > scratch/aerowlan_exercises/module3_output.txt 2>&1</code>
                  <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('export NS_LOG=\&quot;AeroWlanModule3=info\&quot; && ./ns3 run \&quot;scratch/aerowlan_exercises/module3_assignment --packetSize=512\&quot; > scratch/aerowlan_exercises/module3_output.txt 2>&1')">Copy</button>
                </div>
              </div>
              
              <h4>Step 3: Submit logs for verification</h4>
              <p>Open the generated text file, copy its content, and paste it into the submission paste area below to submit:</p>
              <div class="assignment-cmd-container">
                <div class="assignment-cmd-label">Verification Output File</div>
                <div class="assignment-cmd-box">
                  <code>scratch/aerowlan_exercises/module3_output.txt</code>
                  <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('scratch/aerowlan_exercises/module3_output.txt')">Copy Path</button>
                </div>
              </div>
            `,
            assignmentVerifyKeyword: "Simulation starting with packetSize: 512",
            practiceFile: "scratch/aerowlan_exercises/module3_assignment.cc"
          }
        ]
      },
      {
        id: 7,
        title: "Module 7: Building Topologies",
        description: "Shared CSMA bus networks, channel attributes, and wireless topologies (second.cc and third.cc).",
        lessons: [
          {
            id: "T1-M7-L1",
            title: "7.1 Bus Network Topology & 7.2 Attributes",
            moduleTitle: "Track 1 • Module 7 • Lesson 1",
            body: `
              <p>Constructing mixed-media networks is essential to simulate modern architectures (e.g. bridging local ethernet busses to remote servers). In ns-3, we do this by sharing a single host (node pointer) between different helper configurations.</p>
              <h4>1. Sharing Nodes Between Topologies</h4>
              <p>Let's inspect how the classic <code>second.cc</code> simulation constructs a shared bus LAN connected to a point-to-point link:</p>
              <pre><code>NodeContainer p2pNodes;
p2pNodes.Create (2); // Node 0 and Node 1

NodeContainer csmaNodes;
csmaNodes.Add (p2pNodes.Get (1)); // Node 1 is now added to the CSMA container
csmaNodes.Create (3); // Node 1, Node 2, Node 3, and Node 4 on the CSMA LAN</code></pre>
              <p>This links both networks, allowing packets to hop from a P2P node, through Node 1 (acting as a gateway), onto the CSMA network.</p>
              <h4>2. CSMA Shared Bus Channel Configurations</h4>
              <p>To configure transmission speeds and channel propagation delays, we use the [[CsmaHelper]]:</p>
              <pre><code>CsmaHelper csma;
csma.SetChannelAttribute ("DataRate", StringValue ("100Mbps"));
csma.SetChannelAttribute ("Delay", TimeValue (NanoSeconds (6560)));
NetDeviceContainer csmaDevices = csma.Install (csmaNodes);</code></pre>
              <p>This instantiates a shared physical bus channel and installs a [[NetDevice]] on each node in the container.</p>
              
              <div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; padding: 12px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                <strong style="color: #a5b4fc; display: block; margin-bottom: 6px;">💡 Layman's Analogy:</strong>
                A mixed-media network is like a shipping center where packages arrive by train (Point-to-Point link) and are unloaded at a central depot (Gateway Node). From there, local delivery trucks load the packages and distribute them along the city streets (CSMA bus network) or drop them off via drones (WiFi network). The Gateway Node must participate in both worlds to bridge them.
              </div>
            `
          },
          {
            id: "T1-M7-L2",
            title: "7.3 Wireless Network Topology (third.cc)",
            moduleTitle: "Track 1 • Module 7 • Lesson 2",
            body: `
              <p>Wireless networks introduce physical channels (frequencies, air medium) and MAC layers (association state machines, SSIDs). In ns-3, we setup WiFi links by separating the Physical Layer, MAC Layer, and wireless Standard configuration.</p>
              <h4>1. Initializing Physical & Channel Helpers</h4>
              <p>To simulate signal decay and propagation in the air, we initialize physical layer helpers. General WiFi networks use the [[YansWifiPhyHelper]] and [[YansWifiChannelHelper]]:</p>
              <pre><code>YansWifiChannelHelper channel = YansWifiChannelHelper::Default ();
YansWifiPhyHelper phy;
phy.SetChannel (channel.Create ());</code></pre>
              <h4>2. Standard & MAC Configuration</h4>
              <p>The [[WifiHelper]] manages rate adaptation and standard definitions (e.g., 802.11n, 802.11ac, or 802.11be), while [[WifiMacHelper]] handles node roles (Access Point vs Station) and SSIDs:</p>
              <pre><code>WifiHelper wifi;
wifi.SetStandard (WIFI_STANDARD_80211ac);

WifiMacHelper mac;
Ssid ssid = Ssid ("ns-3-wifi");
// Station (STA) MAC Setup:
mac.SetType ("ns3::StaWifiMac", "Ssid", SsidValue (ssid));
NetDeviceContainer staDevices = wifi.Install (phy, mac, staNodes);

// Access Point (AP) MAC Setup:
mac.SetType ("ns3::ApWifiMac", "Ssid", SsidValue (ssid));
NetDeviceContainer apDevices = wifi.Install (phy, mac, wifiApNode);</code></pre>
              <p>The physical devices coordinate standard-specific frame exchanges automatically.</p>
            `
          },
          {
            id: "T1-M7-L3",
            title: "7.4 Queues & Buffer Management",
            moduleTitle: "Track 1 • Module 7 • Lesson 3",
            body: `
              <p>Packets traversing network devices are stored in queues. ns-3 NetDevices implement queuing models (e.g. DropTailQueue) to manage congestion. If a queue fills up, incoming packets are dropped, simulating packet drops.</p>
              <h4>Queuing Models in ns-3:</h4>
              <ul>
                <li><strong>DropTailQueue:</strong> Standard FIFO buffer that drops packets at the tail of the queue when full.</li>
                <li><strong>CoDel (Controlled Delay):</strong> Modern active queue management (AQM) model that drops packets based on queue delay, preventing bufferbloat.</li>
              </ul>
              <pre><code>// Customize P2P device queue limits:
p2p.SetQueue ("ns3::DropTailQueue&lt;Packet&gt;", "MaxSize", QueueSizeValue (QueueSize ("100p")));</code></pre>
            `
          },
          {
            id: "T1-M7-L4",
            title: "7.5 Complete Topology Example Code",
            moduleTitle: "Track 1 • Module 7 • Lesson 4",
            body: `
              <p>Below is a complete, compilable C++ simulation script establishing a mixed Point-to-Point and WiFi network. Study this structure before starting the programming assignment.</p>
              
              <div class="topology-diagram" style="display: flex; flex-direction: column; align-items: center; gap: 20px; margin: 20px 0; padding: 20px; background: rgba(15, 23, 42, 0.6); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <div style="display: flex; align-items: center; justify-content: center; gap: 20px; width: 100%;">
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="width: 44px; height: 44px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; border: 2px solid #60a5fa;">Node 0</div>
                    <span style="font-size: 10px; margin-top: 4px; color: #94a3b8;">10.1.1.1 (P2P Host)</span>
                  </div>
                  <div style="width: 80px; height: 4px; background: #64748b; position: relative;">
                    <span style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 9px; color: #a5b4fc; white-space: nowrap;">P2P (5Mbps / 2ms)</span>
                  </div>
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: #eab308; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; border: 2px solid #fde047; box-shadow: 0 0 10px rgba(234, 179, 8, 0.5);">Node 1</div>
                    <span style="font-size: 10px; margin-top: 4px; color: #94a3b8; text-align: center; line-height: 1.2;">AP / Gateway<br>10.1.1.2 / 10.1.2.3</span>
                  </div>
                </div>
                <div style="width: 80%; height: 1px; border-top: 1px dashed rgba(99, 102, 241, 0.4); margin: 5px 0;"></div>
                <div style="display: flex; align-items: center; justify-content: center; gap: 40px; width: 100%;">
                  <div style="display: flex; flex-direction: column; align-items: center; position: relative;">
                    <span style="position: absolute; top: -25px; font-size: 14px; color: #60a5fa;">📶</span>
                    <div style="width: 44px; height: 44px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; border: 2px solid #34d399;">Node 2</div>
                    <span style="font-size: 10px; margin-top: 4px; color: #94a3b8;">10.1.2.1 (WiFi STA 1)</span>
                  </div>
                  <div style="display: flex; flex-direction: column; align-items: center; position: relative;">
                    <span style="position: absolute; top: -25px; font-size: 14px; color: #60a5fa;">📶</span>
                    <div style="width: 44px; height: 44px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; border: 2px solid #34d399;">Node 3</div>
                    <span style="font-size: 10px; margin-top: 4px; color: #94a3b8;">10.1.2.2 (WiFi STA 2)</span>
                  </div>
                </div>
              </div>

              <pre style="background:#05070c; padding:12px; border-radius:6px; border:1px solid var(--border-glow); overflow-x:auto;"><code style="font-family:monospace; color:#34d399; font-size:12px; white-space:pre;">#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include "ns3/wifi-module.h"
#include "ns3/mobility-module.h"
#include "ns3/internet-module.h"
#include &lt;iostream&gt;

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  // 1. Create nodes
  NodeContainer p2pNodes;
  p2pNodes.Create (2); // Node 0 and Node 1

  NodeContainer wifiStaNodes;
  wifiStaNodes.Create (2); // Node 2 and Node 3
  NodeContainer wifiApNode = p2pNodes.Get (1); // Node 1 is both wired and AP gateway

  // 2. Configure Point-to-Point Link
  PointToPointHelper p2p;
  p2p.SetDeviceAttribute ("DataRate", StringValue ("5Mbps"));
  p2p.SetChannelAttribute ("Delay", StringValue ("2ms"));
  NetDeviceContainer p2pDevices = p2p.Install (p2pNodes);

  // 3. Configure WiFi Channel & Physical layers
  YansWifiChannelHelper channel = YansWifiChannelHelper::Default ();
  YansWifiPhyHelper phy;
  phy.SetChannel (channel.Create ());

  WifiHelper wifi;
  wifi.SetStandard (WIFI_STANDARD_80211ac);
  wifi.SetRemoteStationManager ("ns3::ConstantRateWifiManager");

  // 4. Configure MAC layers & SSIDs
  WifiMacHelper mac;
  Ssid ssid = Ssid ("wifi-topology");

  mac.SetType ("ns3::StaWifiMac", "Ssid", SsidValue (ssid));
  NetDeviceContainer staDevices = wifi.Install (phy, mac, wifiStaNodes);

  mac.SetType ("ns3::ApWifiMac", "Ssid", SsidValue (ssid));
  NetDeviceContainer apDevice = wifi.Install (phy, mac, wifiApNode);

  // 5. Configure positions (Mobility)
  MobilityHelper mobility;
  Ptr&lt;ListPositionAllocator&gt; positionAlloc = CreateObject&lt;ListPositionAllocator&gt; ();
  positionAlloc-&gt;Add (Vector (0.0, 0.0, 0.0)); // Node 0 (P2P Node)
  positionAlloc-&gt;Add (Vector (5.0, 0.0, 0.0)); // Node 1 (AP Gateway)
  positionAlloc-&gt;Add (Vector (10.0, 0.0, 0.0)); // Node 2 (STA 1)
  positionAlloc-&gt;Add (Vector (15.0, 0.0, 0.0)); // Node 3 (STA 2)
  mobility.SetPositionAllocator (positionAlloc);
  mobility.SetMobilityModel ("ns3::ConstantPositionMobilityModel");
  
  // Install mobility on all nodes including P2P Nodes
  mobility.Install (p2pNodes);
  mobility.Install (wifiStaNodes);

  // 6. Install Network Stack & Assign IP Subnets
  InternetStackHelper stack;
  stack.Install (p2pNodes.Get (0)); // Node 0
  stack.Install (p2pNodes.Get (1)); // Node 1 (AP Gateway)
  stack.Install (wifiStaNodes);     // Node 2, Node 3

  Ipv4AddressHelper address;
  address.SetBase ("10.1.1.0", "255.255.255.0");
  address.Assign (p2pDevices); // Subnet for wired link

  address.SetBase ("10.1.2.0", "255.255.255.0");
  address.Assign (staDevices); // Subnets for stations
  address.Assign (apDevice);   // Subnet for AP interface

  Ipv4GlobalRoutingHelper::PopulateRoutingTables ();

  std::cout &lt;&lt; "Mixed P2P and WiFi topology built successfully." &lt;&lt; std::endl;
  return 0;
}</code></pre>
            `
          },
          {
            id: "T1-M7-Q",
            title: "Module 7 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 1 • Module 7 • Assessment",
            quiz: [
              {
                question: "1. In second.cc, how is the point-to-point link bridged to the CSMA network?",
                options: [
                  { text: "Using a dedicated gateway node shared between containers", isCorrect: true },
                  { text: "By using wireless routing", isCorrect: false },
                  { text: "They share the same physical cable", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Node 1 is shared by both NodeContainers, bridging the links.",
                feedbackError: "Incorrect. The networks are bridged by sharing a node between containers. Try again!"
              },
              {
                question: "2. Which helper connects nodes to a wireless channel?",
                options: [
                  { text: "CsmaHelper", isCorrect: false },
                  { text: "WifiHelper", isCorrect: true },
                  { text: "PointToPointHelper", isCorrect: false }
                ],
                feedbackSuccess: "Correct! WifiHelper installs the physical wireless stack.",
                feedbackError: "Incorrect. Use WifiHelper to deploy wireless components. Try again!"
              },
              {
                question: "3. What is Ssid used for in WiFi configurations?",
                options: [
                  { text: "To encrypt packet content", isCorrect: false },
                  { text: "To specify the wireless network name identifier for association", isCorrect: true },
                  { text: "To set channel frequency", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Ssid defines the service set identification matching STAs to APs.",
                feedbackError: "Incorrect. Ssid specifies the network name. Try again!"
              },
              {
                question: "4. What happens when a NetDevice queue fills up in ns-3?",
                options: [
                  { text: "Incoming packets are dropped (e.g., DropTail)", isCorrect: true },
                  { text: "The simulation stops", isCorrect: false },
                  { text: "Nodes are automatically moved closer", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Congestion causes tail-drops in the NetDevice queue.",
                feedbackError: "Incorrect. Packets are dropped when the queue overflows. Try again!"
              },
              {
                question: "5. What routing helper constructs static routing tables dynamically in third.cc?",
                options: [
                  { text: "Ipv4GlobalRoutingHelper", isCorrect: true },
                  { text: "RipHelper", isCorrect: false },
                  { text: "OspfHelper", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Global routing helper automatically builds static routing tables.",
                feedbackError: "Incorrect. GlobalRoutingHelper builds static routing paths. Try again!"
              }
            ]
          },
          {
            id: "T1-M7-A",
            title: "Module 7 Programming Assignment",
            isAssignmentOnly: true,
            moduleTitle: "Track 1 • Module 7 • Assignment",
            assignmentInstructions: `
              <h4>Assignment Objective:</h4>
              <p>Compile and run the Yans WiFi simulation to verify that wireless stations associate and transmit data packets to the AP.</p>
              
              <h4>Step 1: Open Terminal</h4>
              
              <h4>Step 2: Build the project</h4>
              <pre><code>./ns3 build</code></pre>
              
              <h4>Step 3: Run the simulation and save output</h4>
              <p>Run the script and redirect stdout to <code>module7_output.txt</code>:</p>
              <pre><code>./ns3 run scratch/aerowlan_exercises/simple-wifi > scratch/aerowlan_exercises/module7_output.txt 2>&1</code></pre>
              
              <h4>Step 4: Submit output</h4>
              <p>Copy all contents of <code>module7_output.txt</code> and paste it in the box below to verify.</p>
            `,
            assignmentVerifyKeyword: "Starting Yans Wifi simulation...",
            practiceFile: "scratch/aerowlan_exercises/simple-wifi.cc"
          }
        ]
      },
      {
        id: 8,
        title: "Module 8: Tracing",
        description: "Deep dive into the tracing system: background, callback signatures, and trace helpers.",
        lessons: [
          {
            id: "T1-M8-L1",
            title: "8.1 Background & 8.2 Overview",
            moduleTitle: "Track 1 • Module 8 • Lesson 1",
            body: `
              <p>The ns-3 tracing system separates **event generation** (inside module classes) from **user data output processing** (custom scripts). Decoupling these roles enables users to query internal simulator variables without changing the underlying components or modifying engine headers.</p>
              
              <h4>1. Limits of "Blunt Instruments" (std::cout and NS_LOG)</h4>
              <p>While printing with <code>std::cout</code> or injecting <code>NS_LOG</code> logs is easy, it is not recommended for serious simulation data collection:</p>
              <ul>
                <li><strong>Log Component Limits:</strong> <code>NS_LOG</code> filters outputs by file/module, producing massive volumes of text that must be processed offline via grep, sed, or awk scripts.</li>
                <li><strong>No API Guarantees:</strong> Log formats are not considered public APIs and can change between ns-3 versions, breaking external scripts.</li>
                <li><strong>Performance Penalties:</strong> Logging is disabled in optimized builds. Since debug builds run significantly slower, relying on logs limits performance.</li>
              </ul>

              <h4>2. Separation Design Goals</h4>
              <p>The tracing system was built with three primary design goals:</p>
              <ul>
                <li><strong>Trace Sources:</strong> Internal event generators configured inside class scopes. Sources introduce negligible overhead (a basic null-pointer check) when inactive.</li>
                <li><strong>Trace Sinks:</strong> User-defined consumer functions that process data emitted by sources when connected.</li>
                <li><strong>No Compilation Requirements:</strong> Connections are registered at runtime using the Config subsystem, bypassing recompilation cycles.</li>
              </ul>
              
              <div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; padding: 12px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                <strong style="color: #a5b4fc; display: block; margin-bottom: 6px;">💡 Layman's Analogy:</strong>
                Tracing is like installing toll booths (trace sources) on a highway. Every time a car (packet) passes, the toll booth logs the timestamp and car details. You don't have to tear down the highway structure to collect records; you simply attach sensors to existing exits (trace sinks).
              </div>
            `
          },
          {
            id: "T1-M8-L2",
            title: "8.3 Minimal Tracing Walkthrough (fourth.cc)",
            moduleTitle: "Track 1 • Module 8 • Lesson 2",
            body: `
              <p>To understand the core mechanisms, let's explore a simplified implementation of a tracing class similar to <code>fourth.cc</code> in the ns-3 tutorial.</p>
              
              <h4>1. Registering the Trace Source</h4>
              <p>The trace source must live in an object inheriting from [[Object]]. We register it within the [[TypeId]] structure using <code>.AddTraceSource</code>:</p>
              <pre><code>class MyObject : public Object
{
public:
  static TypeId GetTypeId () {
    static TypeId tid = TypeId ("MyObject")
      .SetParent (Object::GetTypeId ())
      .AddConstructor&lt;MyObject&gt; ()
      .AddTraceSource ("MyInteger",
                       "An integer value to trace.",
                       MakeTraceSourceAccessor (&amp;MyObject::m_myInt),
                       "ns3::TracedValueCallback::Int32");
    return tid;
  }
  MyObject () {}
  TracedValue&lt;int32_t&gt; m_myInt; // Traced member
};</code></pre>
              <p>By declaring <code>m_myInt</code> as a [[TracedValue]], ns-3 overrides its assignment operators. Any update to this variable automatically triggers all registered trace sinks.</p>

              <h4>2. Writing and Connecting the Trace Sink</h4>
              <p>The trace sink is a standard C++ callback function matching the expected signature (which passes the old value and new value):</p>
              <pre><code>void IntTrace (int32_t oldValue, int32_t newValue)
{
  std::cout &lt;&lt; "Traced: " &lt;&lt; oldValue &lt;&lt; " -> " &lt;&lt; newValue &lt;&lt; std::endl;
}</code></pre>
              <p>We bind this callback in <code>main()</code> using the <code>TraceConnectWithoutContext</code> method:</p>
              <pre><code>Ptr&lt;MyObject&gt; myObj = CreateObject&lt;MyObject&gt; ();
myObj-&gt;TraceConnectWithoutContext ("MyInteger", MakeCallback (&amp;IntTrace));
myObj-&gt;m_myInt = 1234; // Automatically fires IntTrace!</code></pre>
            `
          },
          {
            id: "T1-M8-L3",
            title: "8.4 Config Paths, Contexts & Trace Helpers",
            moduleTitle: "Track 1 • Module 8 • Lesson 3",
            body: `
              <p>In larger simulations, we query trace sources inside global helper classes using string namespaces and contexts.</p>
              
              <h4>1. Config Paths and Wildcards</h4>
              <p>The ns-3 configuration namespace mimics a filesystem. We use [[Config::Connect]] with path wildcards (<code>*</code>) to hook trace sinks to multiple nodes in a single statement:</p>
              <pre><code>Config::Connect ("/NodeList/*/$ns3::MobilityModel/CourseChange", MakeCallback (&amp;CourseChangeCallback));</code></pre>
              
              <h4>2. Context-based vs Context-less Connections</h4>
              <ul>
                <li><strong>TraceConnectWithoutContext:</strong> Connects a sink that only receives the variables updated by the trace source.</li>
                <li><strong>TraceConnect:</strong> Connects a sink that also receives a <code>std::string context</code> path parameter as its first argument (e.g., <code>"/NodeList/1/$ns3::MobilityModel/CourseChange"</code>). This allows your callback to determine *which* specific node triggered the event.</li>
              </ul>

              <h4>3. Pre-packaged Trace Helpers</h4>
              <p>Instead of writing callbacks from scratch, ns-3 helpers automate standard logging formats:</p>
              <ul>
                <li><strong>PCAP (Packet Capture) Helpers:</strong> Generates standard binary trace files compatible with Wireshark/tcpdump.
                  <pre><code>p2p.EnablePcapAll ("p2p-capture-prefix");</code></pre>
                </li>
                <li><strong>ASCII Helpers:</strong> Generates plaintext trace files documenting packet movements across node queues.
                  <pre><code>AsciiTraceHelper ascii;
phy.EnableAsciiAll (ascii.CreateFileStream ("wifi-capture.tr"));</code></pre>
                </li>
              </ul>
            `
          },
          {
            id: "T1-M8-L4",
            title: "8.6 Complete Tracing Example Code",
            moduleTitle: "Track 1 • Module 8 • Lesson 4",
            body: `
              <p>Below is a complete, compilable C++ simulation script demonstrating how to configure static positions and bind a CourseChange callback to trace movements. Review this script structure before attempting the assignment.</p>
              
              <div class="topology-diagram" style="display: flex; flex-direction: column; align-items: center; gap: 10px; margin: 20px 0; padding: 20px; background: rgba(15, 23, 42, 0.6); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <span style="font-size: 11px; color: #a5b4fc; font-weight: 500; margin-bottom: 4px;">2D Mobility Bounds: [-20m, 20m]</span>
                <div style="width: 260px; height: 140px; border: 2px dashed rgba(99, 102, 241, 0.4); background: rgba(30, 41, 59, 0.3); position: relative; border-radius: 4px; overflow: hidden;">
                  <!-- Node 0 -->
                  <div style="position: absolute; top: 30px; left: 50px; display: flex; flex-direction: column; align-items: center;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: #3b82f6; border: 1px solid #60a5fa; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; color: white;">N0</div>
                    <span style="font-size: 8px; color: #cbd5e1; margin-top: 2px;">(0.0, 0.0)</span>
                  </div>
                  <!-- Random walk path indicators -->
                  <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
                    <path d="M 62 42 L 90 70 L 130 50 L 150 90" fill="none" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="3,3" />
                    <path d="M 192 92 L 160 50 L 120 70 L 80 110" fill="none" stroke="#34d399" stroke-width="1.5" stroke-dasharray="3,3" />
                  </svg>
                  <!-- Node 1 -->
                  <div style="position: absolute; top: 80px; left: 180px; display: flex; flex-direction: column; align-items: center;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: #10b981; border: 1px solid #34d399; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; color: white;">N1</div>
                    <span style="font-size: 8px; color: #cbd5e1; margin-top: 2px;">(10.0, 0.0)</span>
                  </div>
                </div>
              </div>
              <pre style="background:#05070c; padding:12px; border-radius:6px; border:1px solid var(--border-glow); overflow-x:auto;"><code style="font-family:monospace; color:#34d399; font-size:12px; white-space:pre;">#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/mobility-module.h"
#include &lt;iostream&gt;

using namespace ns3;

// Trace Sink: custom callback function
void CourseChangeCallback (std::string context, Ptr&lt;const MobilityModel&gt; model)
{
  Vector position = model-&gt;GetPosition ();
  std::cout &lt;&lt; "Context: " &lt;&lt; context 
            &lt;&lt; " | New Position: " &lt;&lt; position &lt;&lt; std::endl;
}

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer nodes;
  nodes.Create (2);

  // Configure mobility
  MobilityHelper mobility;
  Ptr&lt;ListPositionAllocator&gt; positionAlloc = CreateObject&lt;ListPositionAllocator&gt; ();
  positionAlloc-&gt;Add (Vector (0.0, 0.0, 0.0));
  positionAlloc-&gt;Add (Vector (10.0, 0.0, 0.0));
  mobility.SetPositionAllocator (positionAlloc);
  
  // Configure random walk mobility to trigger CourseChange events
  mobility.SetMobilityModel ("ns3::RandomWalk2dMobilityModel",
                             "Bounds", RectangleValue (Rectangle (-20, 20, -20, 20)),
                             "Speed", StringValue ("ns3::ConstantRandomVariable[Constant=2.0]"));
  mobility.Install (nodes);

  // Bind the CourseChange trace source on all nodes to our callback sink
  Config::Connect ("/NodeList/*/$ns3::MobilityModel/CourseChange", MakeCallback (&amp;CourseChangeCallback));

  // Run simulation for 5 seconds
  Simulator::Stop (Seconds (5.0));
  Simulator::Run ();
  Simulator::Destroy ();

  std::cout &lt;&lt; "Simulation tracing finished successfully." &lt;&lt; std::endl;
  return 0;
}</code></pre>
            `
          },
          {
            id: "T1-M8-Q",
            title: "Module 8 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 1 • Module 8 • Assessment",
            quiz: [
              {
                question: "1. Which method binds a Trace Sink callback function to a Trace Source path?",
                options: [
                  { text: "Config::Connect", isCorrect: true },
                  { text: "Simulator::Schedule", isCorrect: false },
                  { text: "Node::Install", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Config::Connect resolves string paths and binds callbacks to sources.",
                feedbackError: "Incorrect. Use Config::Connect to associate trace paths with sinks. Try again!"
              },
              {
                question: "2. What is the syntax wrapper used to register a callback function in ns-3?",
                options: [
                  { text: "MakeCallback", isCorrect: true },
                  { text: "CreateObject", isCorrect: false },
                  { text: "Bind", isCorrect: false }
                ],
                feedbackSuccess: "Correct! MakeCallback converts a function pointer into a type-safe callback wrapper.",
                feedbackError: "Incorrect. MakeCallback wraps C++ function pointers for trace bindings. Try again!"
              },
              {
                question: "3. In a trace path like /NodeList/*, what does the asterisk (*) stand for?",
                options: [
                  { text: "Wildcard matching all Node indices", isCorrect: true },
                  { text: "A multiplication operator", isCorrect: false },
                  { text: "Only Node 0", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Asterisks serve as wildcards to connect all nodes.",
                feedbackError: "Incorrect. The asterisk acts as a wildcard, connecting to all nodes in the container. Try again!"
              },
              {
                question: "4. What metadata parameter does a trace path use to identify class types dynamically?",
                options: [
                  { text: "ClassName", isCorrect: false },
                  { text: "TypeId name preceded by a dollar sign (e.g. $ns3::MobilityModel)", isCorrect: true },
                  { text: "Object identifier", isCorrect: false }
                ],
                feedbackSuccess: "Correct! The dollar sign prefix casts objects dynamically using TypeId.",
                feedbackError: "Incorrect. Specify the class type using the TypeId name with a dollar sign prefix. Try again!"
              },
              {
                question: "5. What file contains the binary packet captures generated by trace helpers?",
                options: [
                  { text: ".tr file", isCorrect: false },
                  { text: ".pcap file", isCorrect: true },
                  { text: ".log file", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Libpcap format traces end in .pcap.",
                feedbackError: "Incorrect. PCAP outputs use the .pcap extension. Try again!"
              }
            ]
          },
          {
            id: "T1-M8-A",
            title: "Module 8 Programming Assignment",
            isAssignmentOnly: true,
            moduleTitle: "Track 1 • Module 8 • Assignment",
            assignmentInstructions: `
              <h4>Assignment Objective:</h4>
              <p>Configure PCAP capturing, run the simulation, and verify that the generated PCAP traces can be parsed on the Linux shell.</p>
              
              <h4>Step 1: Open Terminal</h4>
              
              <h4>Step 2: Run the simple-wifi simulation with PCAP flag enabled</h4>
              <pre><code>./ns3 run scratch/aerowlan_exercises/simple-wifi -- --pcap=1</code></pre>
              
              <h4>Step 3: Read the generated PCAP file using tcpdump and save output</h4>
              <p>Convert the binary PCAP file to a text output in <code>module8_output.txt</code>:</p>
              <pre><code>tcpdump -nn -tt -r TeslaSimpleWifi-0-0.pcap > scratch/aerowlan_exercises/module8_output.txt 2>&1</code></pre>
              
              <h4>Step 4: Submit output</h4>
              <p>Paste the contents of <code>module8_output.txt</code> below to verify your trace parsing.</p>
            `,
            assignmentVerifyKeyword: "reading from file TeslaSimpleWifi-0-0.pcap",
            practiceFile: "scratch/aerowlan_exercises/simple-wifi.cc"
          }
        ]
      },
      {
        id: 9,
        title: "Module 9: Data Collection",
        description: "Parsing simulation values, exporting statistical logs, and utilizing GnuplotHelper.",
        lessons: [
          {
            id: "T1-M9-L1",
            title: "9.1 Motivation & 9.2 Data Collection Framework (DCF)",
            moduleTitle: "Track 1 • Module 9 • Lesson 1",
            body: `
              <p>One of the main goals of running network simulations is to collect output data for research. While PCAP and ASCII files are useful, they struggle with non-packet state transitions (e.g., routing state changes), create heavy disk I/O bottlenecks in large simulations, and cannot easily compute statistics online during execution.</p>
              
              <h4>1. The Three-Tier DCF Architecture</h4>
              <p>The ns-3 Data Collection Framework (DCF) separates data generation from formatting through a structured three-tier layout:</p>
              <ul>
                <li><strong>Probes:</strong> Hook directly into trace sources. Probes receive the values emitted by sources and convert/cast them into clean, standardized types (e.g., <code>ns3::DoubleProbe</code>, <code>ns3::Ipv4PacketProbe</code>).</li>
                <li><strong>Collectors:</strong> Perform online calculations or data reductions, such as counting packets or computing running averages.</li>
                <li><strong>Aggregators:</strong> Format the processed values and write them to output files (e.g., CSV, text files), plot scripts, or SQL databases.</li>
              </ul>
              
              <div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; padding: 12px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                <strong style="color: #a5b4fc; display: block; margin-bottom: 6px;">💡 Layman's Analogy:</strong>
                Collecting simulation stats is like running a restaurant. Instead of searching through every paper receipt (PCAP file) at the end of the day to compute profit, you install a central ledger system (FlowMonitor) at the cash register. The ledger automatically logs sales, meal preparation times, and customer counts, printing a clean balance sheet (XML file) at closing time.
              </div>
            `
          },
          {
            id: "T1-M9-L2",
            title: "9.3 GnuplotHelper & 9.4 FileHelper",
            moduleTitle: "Track 1 • Module 9 • Lesson 2",
            body: `
              <p>To visualize results quickly, ns-3 provides pre-built helpers that connect trace sources directly to file writers and plotters.</p>
              
              <h4>1. GnuplotHelper Workflow</h4>
              <p>The [[GnuplotHelper]] automatically generates charts by creating three output files:</p>
              <ul>
                <li><code>.dat</code> file: Space-delimited timestamps and raw statistical data series.</li>
                <li><code>.plt</code> file: Gnuplot script containing plot layout commands, titles, and legends.</li>
                <li><code>.sh</code> script: A shell utility that calls Gnuplot to render the data into a final <code>.png</code> graphic.</li>
              </ul>
              <pre><code>GnuplotHelper plotHelper;
plotHelper.ConfigurePlot ("packet-bytes-over-time", "Packet Byte Count vs. Time", "Time (Seconds)", "Bytes");
plotHelper.PlotProbe ("ns3::Ipv4PacketProbe", "/NodeList/*/$ns3::Ipv4L3Protocol/Tx", "OutputBytes", "Tx Bytes", GnuplotAggregator::KEY_BELOW);</code></pre>
              
              <h4>2. FileHelper Workflow</h4>
              <p>The [[FileHelper]] writes formatted text columns directly to disk, ready for import into MATLAB or Python (Pandas):</p>
              <pre><code>FileHelper fileHelper;
fileHelper.ConfigureFile ("bytes-log", FileAggregator::FORMATTED);
fileHelper.Set2dFormat ("Time (s) = %.3e\\tBytes = %.0f");
fileHelper.WriteProbe ("ns3::Ipv4PacketProbe", "/NodeList/*/$ns3::Ipv4L3Protocol/Tx", "OutputBytes");</code></pre>
            `
          },
          {
            id: "T1-M9-L3",
            title: "9.5 FlowMonitor Framework",
            moduleTitle: "Track 1 • Module 9 • Lesson 3",
            body: `
              <p>The **FlowMonitor** helper acts as a virtual flow sensor installed on network nodes. It matches passing packets into unique end-to-end "flows" defined by the 5-tuple:</p>
              <div style="background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); padding: 10px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #38bdf8; margin: 12px 0;">
                (Source IP, Destination IP, Protocol, Source Port, Destination Port)
              </div>
              
              <h4>Key Metrics Tracked per Flow:</h4>
              <ul>
                <li><strong>TxPackets / RxPackets:</strong> Total packets successfully sent and received.</li>
                <li><strong>TxBytes / RxBytes:</strong> Cumulative packet sizes in bytes.</li>
                <li><strong>LostPackets:</strong> Number of packets dropped in flight (Tx minus Rx).</li>
                <li><strong>DelaySum:</strong> Cumulative delay of all packets. Average delay is calculated as <code>DelaySum / RxPackets</code>.</li>
                <li><strong>JitterSum:</strong> Jitter variation sum between consecutive arrivals.</li>
              </ul>
              <p>FlowMonitor writes these aggregated metrics to a structured XML file for easy post-processing:</p>
              <pre><code>FlowMonitorHelper flowmon;
Ptr&lt;FlowMonitor&gt; monitor = flowmon.InstallAll ();
...
monitor-&gt;SerializeToXmlFile ("simulation_stats.xml", true, true);</code></pre>
            `
          },
          {
            id: "T1-M9-L4",
            title: "9.6 Complete FlowMonitor Example Code",
            moduleTitle: "Track 1 • Module 9 • Lesson 4",
            body: `
              <p>Below is a complete, compilable C++ simulation script demonstrating how to install FlowMonitor on a point-to-point network topology, generate bulk UDP traffic, and serialize the flow statistics to an XML report.</p>
              
              <div class="topology-diagram" style="display: flex; flex-direction: column; align-items: center; gap: 12px; margin: 20px 0; padding: 20px; background: rgba(15, 23, 42, 0.6); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.3); position: relative;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 16px; width: 100%;">
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="width: 44px; height: 44px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; border: 2px solid #60a5fa; box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);">Node 0</div>
                    <span style="font-size: 9px; margin-top: 4px; color: #94a3b8;">10.1.1.1 (OnOff Tx)</span>
                  </div>
                  <div style="flex-grow: 1; height: 4px; background: #64748b; position: relative; max-width: 140px;">
                    <span style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 9px; color: #a5b4fc; white-space: nowrap;">Point-to-Point Link</span>
                  </div>
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="width: 44px; height: 44px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; border: 2px solid #34d399; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);">Node 1</div>
                    <span style="font-size: 9px; margin-top: 4px; color: #94a3b8;">10.1.1.2 (Sink Rx)</span>
                  </div>
                </div>
                <!-- FlowMonitor overlay bubble -->
                <div style="background: rgba(236, 72, 153, 0.1); border: 1px solid #ec4899; border-radius: 6px; padding: 6px 12px; font-size: 10px; color: #f472b6; font-weight: bold; margin-top: 8px; display: flex; align-items: center; gap: 6px; box-shadow: 0 0 10px rgba(236, 72, 153, 0.2);">
                  <span>📊</span> FlowMonitor intercepting throughput, delay, and packet loss metrics...
                </div>
              </div>

              <pre style="background:#05070c; padding:12px; border-radius:6px; border:1px solid var(--border-glow); overflow-x:auto;"><code style="font-family:monospace; color:#34d399; font-size:12px; white-space:pre;">#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include "ns3/applications-module.h"
#include "ns3/internet-module.h"
#include "ns3/flow-monitor-module.h"
#include &lt;iostream&gt;

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer nodes;
  nodes.Create (2);

  PointToPointHelper p2p;
  p2p.SetDeviceAttribute ("DataRate", StringValue ("5Mbps"));
  p2p.SetChannelAttribute ("Delay", StringValue ("2ms"));
  NetDeviceContainer devices = p2p.Install (nodes);

  InternetStackHelper stack;
  stack.Install (nodes);

  Ipv4AddressHelper address;
  address.SetBase ("10.1.1.0", "255.255.255.0");
  Ipv4InterfaceContainer interfaces = address.Assign (devices);

  // Install UDP bulk traffic flow (OnOff source) targeting Node 1 on port 9
  Address sinkAddress (InetSocketAddress (interfaces.GetAddress (1), 9));
  PacketSinkHelper packetSinkHelper ("ns3::UdpSocketFactory", sinkAddress);
  ApplicationContainer sinkApps = packetSinkHelper.Install (nodes.Get (1));
  sinkApps.Start (Seconds (1.0));

  OnOffHelper onoffHelper ("ns3::UdpSocketFactory", sinkAddress);
  onoffHelper.SetAttribute ("DataRate", StringValue ("500Kbps"));
  onoffHelper.SetAttribute ("PacketSize", UintegerValue (1024));
  ApplicationContainer clientApps = onoffHelper.Install (nodes.Get (0));
  clientApps.Start (Seconds (2.0));
  clientApps.Stop (Seconds (10.0));

  // Initialize and install FlowMonitor
  FlowMonitorHelper flowmon;
  Ptr&lt;FlowMonitor&gt; monitor = flowmon.InstallAll ();

  Simulator::Stop (Seconds (10.0));
  Simulator::Run ();

  // Dump FlowMonitor stats to an XML report file
  monitor-&gt;SerializeToXmlFile ("simple-flowmon.xml", true, true);

  Simulator::Destroy ();
  std::cout &lt;&lt; "Data collection completed successfully." &lt;&lt; std::endl;
  return 0;
}</code></pre>
            `
          },
          {
            id: "T1-M9-Q",
            title: "Module 9 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 1 • Module 9 • Assessment",
            quiz: [
              {
                question: "1. What does DCF stand for in ns-3's statistical tracking framework?",
                options: [
                  { text: "Data Collection Framework", isCorrect: true },
                  { text: "Dynamic Channel Frequency", isCorrect: false },
                  { text: "Distributed Coordination Function", isCorrect: false }
                ],
                feedbackSuccess: "Correct! The Data Collection Framework manages statistics.",
                feedbackError: "Incorrect. The correct expansion is Data Collection Framework. Try again!"
              },
              {
                question: "2. Which helper generates control scripts to plot charts using Gnuplot?",
                options: [
                  { text: "PlotHelper", isCorrect: false },
                  { text: "GnuplotHelper", isCorrect: true },
                  { text: "ChartHelper", isCorrect: false }
                ],
                feedbackSuccess: "Correct! GnuplotHelper builds config files for Gnuplot.",
                feedbackError: "Incorrect. The helper class is GnuplotHelper. Try again!"
              },
              {
                question: "3. What object acts as the aggregator to format output data streams to plaintext files?",
                options: [
                  { text: "FileHelper", isCorrect: true },
                  { text: "Collector", isCorrect: false },
                  { text: "Probe", isCorrect: false }
                ],
                feedbackSuccess: "Correct! FileHelper writes values to structured column text files.",
                feedbackError: "Incorrect. Use FileHelper to format output streams. Try again!"
              },
              {
                question: "4. What class serves as the probe to tap into target variables in the DCF?",
                options: [
                  { text: "Probe", isCorrect: true },
                  { text: "Sink", isCorrect: false },
                  { text: "Device", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Probes connect directly to Trace Sources to sample metrics.",
                feedbackError: "Incorrect. Probe classes are used to tap variables. Try again!"
              },
              {
                question: "5. What tool is commonly used to process raw data columns exported by FileHelper?",
                options: [
                  { text: "Wireshark", isCorrect: false },
                  { text: "Python / Pandas / MATLAB", isCorrect: true },
                  { text: "NetAnim", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Exported CSV/text files are processed using data analysis tools.",
                feedbackError: "Incorrect. Use statistical suites like Python (Pandas) or MATLAB. Try again!"
              }
            ]
          },
          {
            id: "T1-M9-A",
            title: "Module 9 Programming Assignment",
            isAssignmentOnly: true,
            moduleTitle: "Track 1 • Module 9 • Assignment",
            assignmentInstructions: `
              <h4>Assignment Objective:</h4>
              <p>Validate the simulation directory outputs and record file sizes of the generated PCAP files.</p>
              
              <h4>Step 1: Open Terminal</h4>
              
              <h4>Step 2: List the generated PCAP file details</h4>
              <p>Run a directory list command filtering by PCAP extension and redirect to <code>module9_output.txt</code>:</p>
              <pre><code>ls -lh TeslaSimpleWifi-0-0.pcap > scratch/aerowlan_exercises/module9_output.txt 2>&1</code></pre>
              
              <h4>Step 3: Submit output</h4>
              <p>Paste the contents of <code>module9_output.txt</code> below to verify.</p>
            `,
            assignmentVerifyKeyword: "TeslaSimpleWifi-0-0.pcap",
            practiceFile: "scratch/aerowlan_exercises/simple-wifi.cc"
          }
        ]
      },
      {
        id: 10,
        title: "Module 10: Conclusion",
        description: "Future roadmap of ns-3, closing steps, and next stages.",
        lessons: [
          {
            id: "T1-M10-L1",
            title: "10.1 Futures & 10.2 Closing",
            moduleTitle: "Track 1 • Module 10 • Lesson 1",
            body: `
              <p>Congratulations! You have successfully completed the Track 1 ns-3 Foundations course. You have gone from basic node definitions up to complex mixed-media topologies and granular trace parsing.</p>
              <h4>10.1 Advanced Modules & Future Roadmaps:</h4>
              <p>The ns-3 simulator extends far beyond wired channels and basic WiFi. Key advanced fields include:</p>
              <ul>
                <li><strong>LTE & 5G LENA (Cellular):</strong> Custom physical models, scheduling algorithms, and carrier aggregation models maintained by CTTC.</li>
                <li><strong>Satellite Networks:</strong> Simulating LEO/MEO satellite constellations, dynamic orbit path calculations, and propagation delay modeling.</li>
                <li><strong>Network Emulation (TapBridge):</strong> Connecting ns-3 simulated sockets directly to physical computer Ethernet interfaces, allowing real application traffic (e.g. running a real web browser) to traverse your simulated network.</li>
              </ul>
              <h4>10.2 Next Steps:</h4>
              <p>You are now fully prepared to tackle advanced wireless networks in the next segment: **Track 2: WiFi 7/8 Research Pro**!</p>
              
              <div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; padding: 12px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                <strong style="color: #a5b4fc; display: block; margin-bottom: 6px;">💡 Layman's Analogy:</strong>
                Think of Track 1 as building a model toy train track inside your living room (verifying protocol mechanics in software). In Track 2 and advanced ns-3 modules, you lay down intercontinental bullet train tracks (satellite and cellular networks) and hook your toy train set up to the real regional railways outside your house (emulation modes)!
              </div>
            `
          }
        ]
      }
    ]
  },
  {
    name: "Track 2: WiFi 7/8 Research Pro",
    modules: [
      {
        id: 1,
        title: "Module 1: Wireless PHY & Propagation",
        description: "Modeling physical channels, propagation loss, fading, and spectrum frequencies.",
        lessons: [
          {
            id: "T2-M1-L1",
            title: "Spectrum Channel Models vs Yans",
            moduleTitle: "Track 2 • Module 1 • Lesson 1",
            body: `
              <p>In wireless simulations, modeling signal propagation accurately is critical. ns-3 offers two physical layer helpers:</p>
              <ul>
                <li><strong>[[YansWifiPhyHelper]]:</strong> Packet-based model. Simulates transmissions as single-channel blocks. It is fast and simple but cannot simulate frequency-selective fading or subcarrier allocation. Also configures the [[YansWifiChannelHelper]].</li>
                <li><strong>[[SpectrumWifiPhyHelper]]:</strong> Frequency-selective model. Simulates signal Power Spectral Density (PSD) across distinct subcarriers. This is required for modern multi-subcarrier standards (802.11ax/be) employing OFDMA and [[MLO]].</li>
              </ul>
            `
          },
          {
            id: "T2-M1-L2",
            title: "Propagation Loss and Delay Models",
            moduleTitle: "Track 2 • Module 1 • Lesson 2",
            body: `
              <p>Signal attenuation over distance is configured via propagation helpers:</p>
              <ul>
                <li><strong>FriisPropagationLossModel:</strong> Models signal decay in clean, line-of-sight free space.</li>
                <li><strong>LogDistancePropagationLossModel:</strong> Computes path loss using a path loss exponent (n) to model various environments (e.g. indoor vs outdoor).</li>
              </ul>
            `
          },
          {
            id: "T2-M1-Q",
            title: "Track 2 Module 1 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 2 • Module 1 • Assessment",
            quiz: [
              {
                question: "1. Which WiFi physical layer helper must be used to model OFDMA subcarriers in ns-3?",
                options: [
                  { text: "YansWifiPhyHelper", isCorrect: false },
                  { text: "SpectrumWifiPhyHelper", isCorrect: true }
                ],
                feedbackSuccess: "Correct! Spectrum model resolves Power Spectral Density across frequency subcarriers.",
                feedbackError: "Incorrect. Yans cannot model subcarrier granularity. You must use SpectrumWifiPhyHelper. Try again!"
              },
              {
                question: "2. What physical effect does FriisPropagationLossModel simulate?",
                options: [
                  { text: "Signal diffraction around buildings", isCorrect: false },
                  { text: "Free-space signal attenuation over distance with line-of-sight", isCorrect: true },
                  { text: "Multipath fading on mobile nodes", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Friis models path loss in clean free space.",
                feedbackError: "Incorrect. Friis models free-space propagation attenuation. Try again!"
              },
              {
                question: "3. What three frequency bands are supported in WiFi 7 (802.11be)?",
                options: [
                  { text: "900 MHz, 2.4 GHz, and 5 GHz", isCorrect: false },
                  { text: "2.4 GHz, 5 GHz, and 6 GHz", isCorrect: true },
                  { text: "5 GHz, 60 GHz, and 70 GHz", isCorrect: false }
                ],
                feedbackSuccess: "Correct! WiFi 7 operates in the 2.4 GHz, 5 GHz, and 6 GHz spectrum bands.",
                feedbackError: "Incorrect. WiFi 7 extends coverage to the 2.4, 5, and 6 GHz bands. Try again!"
              },
              {
                question: "4. How is propagation delay calculated in ConstantSpeedPropagationDelayModel?",
                options: [
                  { text: "By using the speed of light in a vacuum", isCorrect: true },
                  { text: "It is set to a constant value independent of distance", isCorrect: false },
                  { text: "By simulating acoustic delays", isCorrect: false }
                ],
                feedbackSuccess: "Correct! The model divides distance by speed of light to determine delay.",
                feedbackError: "Incorrect. The delay is calculated dynamically as distance divided by the speed of light. Try again!"
              },
              {
                question: "5. What class represents the physical channel in spectrum-based wireless simulations?",
                options: [
                  { text: "YansWifiChannel", isCorrect: false },
                  { text: "MultiModelSpectrumChannel", isCorrect: true },
                  { text: "PointToPointChannel", isCorrect: false }
                ],
                feedbackSuccess: "Correct! MultiModelSpectrumChannel acts as the medium for PSD spectrum signals.",
                feedbackError: "Incorrect. Spectrum simulations utilize MultiModelSpectrumChannel as the medium. Try again!"
              }
            ]
          },
          {
            id: "T2-M1-A",
            title: "Track 2 Module 1 Assignment",
            isAssignmentOnly: true,
            moduleTitle: "Track 2 • Module 1 • Assignment",
            assignmentInstructions: `
              <h4>Assignment Objective:</h4>
              <p>Configure node positioning and execute the Yans WiFi simulation.</p>
              
              <h4>Step 1: Open Terminal</h4>
              
              <h4>Step 2: Run the simple-wifi simulation</h4>
              <pre><code>./ns3 run scratch/aerowlan_exercises/simple-wifi > scratch/aerowlan_exercises/t2_m1_output.txt 2>&1</code></pre>
              
              <h4>Step 3: Submit output</h4>
              <p>Paste the contents of <code>t2_m1_output.txt</code> below to verify your run.</p>
            `,
            assignmentVerifyKeyword: "Wifi Simulation completed.",
            practiceFile: "scratch/aerowlan_exercises/simple-wifi.cc"
          }
        ]
      },
      {
        id: 2,
        title: "Module 2: WiFi MAC Layer & QoS EDCA",
        description: "QoS prioritization, traffic categories, contention window sizes, and frame aggregation.",
        lessons: [
          {
            id: "T2-M2-L1",
            title: "EDCA Access Categories & Contention",
            moduleTitle: "Track 2 • Module 2 • Lesson 1",
            body: `
              <p>IEEE 802.11 QoS is implemented via Enhanced Distributed Channel Access (EDCA). It provides prioritized medium access by defining four Access Categories (ACs):</p>
              <ul>
                <li><strong>AC_VO (Voice):</strong> Shortest contention window and arbitration interframe space (AIFS). Highest priority.</li>
                <li><strong>AC_VI (Video):</strong> High priority.</li>
                <li><strong>AC_BE (Best Effort):</strong> Default medium access.</li>
                <li><strong>AC_BK (Background):</strong> Longest backoff values. Lowest priority.</li>
              </ul>
            `
          },
          {
            id: "T2-M2-L2",
            title: "Frame Aggregation: MSDU and MPDU",
            moduleTitle: "Track 2 • Module 2 • Lesson 2",
            body: `
              <p>To reduce MAC layer overhead (headers and preambles), high-throughput standards employ frame aggregation:</p>
              <ul>
                <li><strong>A-MSDU (Aggregate MAC Service Data Unit):</strong> Combines multiple logical payloads under a single MAC header.</li>
                <li><strong>A-MPDU (Aggregate MAC Protocol Data Unit):</strong> Combines multiple MAC frames (each with header and CRC) inside a single physical packet.</li>
              </ul>
            `
          },
          {
            id: "T2-M2-Q",
            title: "Track 2 Module 2 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 2 • Module 2 • Assessment",
            quiz: [
              {
                question: "1. Which EDCA Access Category is configured with the shortest backoff time?",
                options: [
                  { text: "AC_BE", isCorrect: false },
                  { text: "AC_VI", isCorrect: false },
                  { text: "AC_VO", isCorrect: true }
                ],
                feedbackSuccess: "Correct! AC_VO (Voice) gets priority access to minimize latency.",
                feedbackError: "Incorrect. Voice (AC_VO) has the shortest arbitration Interframe Space (AIFS). Try again!"
              },
              {
                question: "2. How many EDCA Access Categories are defined in standard 802.11 QoS?",
                options: [
                  { text: "2", isCorrect: false },
                  { text: "4", isCorrect: true },
                  { text: "8", isCorrect: false }
                ],
                feedbackSuccess: "Correct! The standard defines 4 queues: VO, VI, BE, and BK.",
                feedbackError: "Incorrect. The IEEE 802.11 standard specifies 4 AC categories. Try again!"
              },
              {
                question: "3. What is the main difference between A-MSDU and A-MPDU aggregation?",
                options: [
                  { text: "A-MSDU groups packets before the MAC header is added; A-MPDU groups complete MAC frames", isCorrect: true },
                  { text: "A-MPDU is only used for voice traffic", isCorrect: false },
                  { text: "A-MSDU is performed at the physical layer", isCorrect: false }
                ],
                feedbackSuccess: "Correct! A-MSDU aggregates payloads; A-MPDU aggregates formatted frames.",
                feedbackError: "Incorrect. A-MSDU aggregates MSDU payloads under one MAC header; A-MPDU aggregates MAC frames. Try again!"
              },
              {
                question: "4. What socket parameter is configured to route packets to specific EDCA queues in ns-3?",
                options: [
                  { text: "Type of Service (TOS) byte", isCorrect: true },
                  { text: "Port number", isCorrect: false },
                  { text: "TTL field", isCorrect: false }
                ],
                feedbackSuccess: "Correct! The TOS field in the IP header maps packets to EDCA access categories.",
                feedbackError: "Incorrect. The TOS (Type of Service) attribute maps packets to EDCA queues. Try again!"
              },
              {
                question: "5. What is the role of Block Acknowledgment (Block Ack) in frame aggregation?",
                options: [
                  { text: "It acknowledges a whole train of aggregate frames (A-MPDU) with a single response frame", isCorrect: true },
                  { text: "It disables packet transmission during collisions", isCorrect: false },
                  { text: "It routes packets to the wired stack", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Block Ack groups multiple frame acknowledgments to reduce overhead.",
                feedbackError: "Incorrect. Block Ack acknowledges multiple MPDUs inside an A-MPDU to save channel overhead. Try again!"
              }
            ]
          },
          {
            id: "T2-M2-A",
            title: "Track 2 Module 2 Assignment",
            isAssignmentOnly: true,
            moduleTitle: "Track 2 • Module 2 • Assignment",
            assignmentInstructions: `
              <h4>Assignment Objective:</h4>
              <p>Map application packets to priority queues using the TOS socket parameter.</p>
              
              <h4>Step 1: Open Terminal</h4>
              
              <h4>Step 2: Run the simple-wifi simulation with TOS logging enabled</h4>
              <pre><code>./ns3 run scratch/aerowlan_exercises/simple-wifi > scratch/aerowlan_exercises/t2_m2_output.txt 2>&1</code></pre>
              
              <h4>Step 3: Submit output</h4>
              <p>Paste the contents of <code>t2_m2_output.txt</code> below to verify your run.</p>
            `,
            assignmentVerifyKeyword: "Wifi Simulation completed.",
            practiceFile: "scratch/aerowlan_exercises/simple-wifi.cc"
          }
        ]
      },
      {
        id: 3,
        title: "Module 3: WiFi 7 & MLO",
        description: "Multi-Link Operation (MLO) configurations, 320 MHz channel allocation, and 4096-QAM.",
        lessons: [
          {
            id: "T2-M3-L1",
            title: "WiFi 7 Multi-Link Operation (MLO)",
            moduleTitle: "Track 2 • Module 3 • Lesson 1",
            body: `
              <p><strong>[[MLO]] (Multi-Link Operation)</strong> allows a single Multi-Link Device (MLD) to utilize multiple physical links (e.g. 5 GHz and 6 GHz links) simultaneously.</p>
              <p>In ns-3.45, [[MLO]] is enabled by configuring multi-link devices using the <code>[[EhtFrameExchangeManager]]</code> and defining links on the <code>[[WifiHelper]]</code>:</p>
              <pre><code>wifi.SetStandard (WIFI_STANDARD_80211be);
wifi.SetMultiLinkType (WifiHelper::DEFAULT_MLD);</code></pre>
            `
          },
          {
            id: "T2-M3-Q",
            title: "Track 2 Module 3 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 2 • Module 3 • Assessment",
            quiz: [
              {
                question: "1. In WiFi 7 MLO, how is the device represented to the IP stack?",
                options: [
                  { text: "As multiple independent network interfaces", isCorrect: false },
                  { text: "As a single logical MAC interface managing multiple physical links", isCorrect: true },
                  { text: "As a wired CSMA connection", isCorrect: false }
                ],
                feedbackSuccess: "Correct! The MLD exposes a single MAC interface to upper layers while splitting traffic over physical links.",
                feedbackError: "Incorrect. An MLD appears as a single logical network interface to the IP layer. Try again!"
              },
              {
                question: "2. What is the maximum single-channel bandwidth supported in 802.11be?",
                options: [
                  { text: "80 MHz", isCorrect: false },
                  { text: "160 MHz", isCorrect: false },
                  { text: "320 MHz", isCorrect: true }
                ],
                feedbackSuccess: "Correct! WiFi 7 supports 320 MHz channels in the 6 GHz band.",
                feedbackError: "Incorrect. 802.11be doubles bandwidth limits up to 320 MHz. Try again!"
              },
              {
                question: "3. What modulation scheme is introduced in WiFi 7?",
                options: [
                  { text: "256-QAM", isCorrect: false },
                  { text: "1024-QAM", isCorrect: false },
                  { text: "4096-QAM", isCorrect: true }
                ],
                feedbackSuccess: "Correct! 4096-QAM allows 12 bits per symbol transmissions.",
                feedbackError: "Incorrect. WiFi 7 introduces 4096-QAM (EhtMcs12 to 15). Try again!"
              },
              {
                question: "4. What does STR stand for in the context of Multi-Link Operation?",
                options: [
                  { text: "Simultaneous Transmission and Reception", isCorrect: true },
                  { text: "Single Traffic Router", isCorrect: false },
                  { text: "Spectrum Temporal Reuse", isCorrect: false }
                ],
                feedbackSuccess: "Correct! STR allows the device to transmit on one link while receiving on another link simultaneously.",
                feedbackError: "Incorrect. STR is Simultaneous Transmission and Reception. Try again!"
              },
              {
                question: "5. What FrameExchangeManager class handles WiFi 7 frames in ns-3.45?",
                options: [
                  { text: "HeFrameExchangeManager", isCorrect: false },
                  { text: "EhtFrameExchangeManager", isCorrect: true },
                  { text: "VhtFrameExchangeManager", isCorrect: false }
                ],
                feedbackSuccess: "Correct! EhtFrameExchangeManager is the EHT-specific control frame manager.",
                feedbackError: "Incorrect. WiFi 7 (EHT) utilizes EhtFrameExchangeManager. Try again!"
              }
            ]
          },
          {
            id: "T2-M3-A",
            title: "Track 2 Module 3 Assignment",
            isAssignmentOnly: true,
            moduleTitle: "Track 2 • Module 3 • Assignment",
            assignmentInstructions: `
              <h4>Assignment Objective:</h4>
              <p>Verify that multi-link operation negotiates multiple links and routes traffic.</p>
              
              <h4>Step 1: Open Terminal</h4>
              
              <h4>Step 2: Run the wifi7-mlo simulation</h4>
              <pre><code>./ns3 run scratch/aerowlan_exercises/wifi7-mlo > scratch/aerowlan_exercises/t2_m3_output.txt 2>&1</code></pre>
              
              <h4>Step 3: Submit output</h4>
              <p>Paste the contents of <code>t2_m3_output.txt</code> below to verify your MLO run.</p>
            `,
            assignmentVerifyKeyword: "Starting WiFi 7 Multi-Link Operation (MLO) simulation...",
            practiceFile: "scratch/aerowlan_exercises/wifi7-mlo.cc"
          }
        ]
      },
      {
        id: 4,
        title: "Module 4: WiFi 8 & Advanced Research",
        description: "Multi-AP Coordinated Spatial Reuse (CoSR), Coordinated Beamforming (CoBF), and UHR models.",
        lessons: [
          {
            id: "T2-M4-L1",
            title: "Multi-AP Spatial Reuse (CoSR)",
            moduleTitle: "Track 2 • Module 4 • Lesson 1",
            body: `
              <p>IEEE 802.11bn (WiFi 8) is named **Ultra High Reliability (UHR)**. The primary research direction focuses on coordination between Access Points (APs) to resolve cell-edge interference.</p>
              <p>Adjacent APs coordinate transmit power dynamically using [[COSR]] (Coordinated Spatial Reuse). By backing off Tx power slightly, both APs can transmit simultaneously to nearby stations on the same channel, bypassing standard CCA threshold backoffs.</p>
              <p>Such models are simulated at the PHY layer using custom extensions like [[UhrPhy]].</p>
            `
          },
          {
            id: "T2-M4-Q",
            title: "Track 2 Module 4 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 2 • Module 4 • Assessment",
            quiz: [
              {
                question: "1. What is the key focus area of the candidate IEEE 802.11bn (WiFi 8) standard?",
                options: [
                  { text: "Ultra High Reliability (UHR) and latency guarantees", isCorrect: true },
                  { text: "Extremely High Throughput (EHT)", isCorrect: false },
                  { text: "Extending range to long distances", isCorrect: false }
                ],
                feedbackSuccess: "Correct! WiFi 8 focuses on reliability (UHR) and ultra-low latency guarantees.",
                feedbackError: "Incorrect. WiFi 8's focus is Ultra High Reliability. Try again!"
              },
              {
                question: "2. How does Coordinated Spatial Reuse (CoSR) facilitate parallel transmissions?",
                options: [
                  { text: "By assigning distinct IP addresses to APs", isCorrect: false },
                  { text: "By dynamically adjusting transmitter power to reduce OBSS interference", isCorrect: true },
                  { text: "By using wired cables", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Power control allows parallel transmissions on overlapping frequencies.",
                feedbackError: "Incorrect. CoSR adjusts Tx power dynamically to enable parallel transmission. Try again!"
              },
              {
                question: "3. What is the function of Coordinated Beamforming (CoBF) in WiFi 8?",
                options: [
                  { text: "To shape multi-antenna radiation patterns to place nulls at neighbor station positions", isCorrect: true },
                  { text: "To increase data rates to 10 Gbps", isCorrect: false },
                  { text: "To increase transmission range", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Spatial nulling prevents cross-talk on overlapping cells.",
                feedbackError: "Incorrect. CoBF coordinates multi-antenna beam vectors to shield neighboring STAs. Try again!"
              },
              {
                question: "4. How does Coordinated OFDMA avoid packet collisions?",
                options: [
                  { text: "By sharing the frequency spectrum orthogonally across basic service sets", isCorrect: true },
                  { text: "By disabling WiFi transmission entirely", isCorrect: false },
                  { text: "By encrypting packets", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Orthogonal frequency allocation prevents OBSS collisions.",
                feedbackError: "Incorrect. Co-OFDMA partitions subcarriers orthogonally across neighboring cells. Try again!"
              },
              {
                question: "5. Where are custom WiFi 8 prototype models usually implemented in the ns-3 directory structure?",
                options: [
                  { text: "In src/wifi or as modular additions in the contrib/ directory", isCorrect: true },
                  { text: "In the build/ folder directly", isCorrect: false },
                  { text: "Inside the doc/ directory", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Developers subclass EHT modules in src/wifi or place prototypes in contrib.",
                feedbackError: "Incorrect. Custom models are placed under src/wifi or in the contrib/ directory. Try again!"
              }
            ]
          },
          {
            id: "T2-M4-A",
            title: "Track 2 Module 4 Assignment",
            isAssignmentOnly: true,
            moduleTitle: "Track 2 • Module 4 • Assignment",
            assignmentInstructions: `
              <h4>Assignment Objective:</h4>
              <p>Simulate Coordinated Spatial Reuse overlapping cells and verify packet transmission.</p>
              
              <h4>Step 1: Open Terminal</h4>
              
              <h4>Step 2: Run the wifi8-cosr simulation</h4>
              <pre><code>./ns3 run scratch/aerowlan_exercises/wifi8-cosr > scratch/aerowlan_exercises/t2_m4_output.txt 2>&1</code></pre>
              
              <h4>Step 3: Submit output</h4>
              <p>Paste the contents of <code>t2_m4_output.txt</code> below to verify your WiFi 8 run.</p>
            `,
            assignmentVerifyKeyword: "Starting WiFi 8 Coordinated Spatial Reuse (CoSR) simulation...",
            practiceFile: "scratch/aerowlan_exercises/wifi8-cosr.cc"
          }
        ]
      }
    ]
  },
  {
    name: "Track 3: C++ Foundations for ns-3",
    modules: [
      {
        id: 1,
        title: "Module 1: Introduction to C++ Fundamentals",
        description: "Standard C++ syntax, primitive variables, standard I/O, control flow statements, and basic function declarations.",
        lessons: [
          {
            id: "T3-M1-L1",
            title: "1.1 Basic Syntax & Compilation Pipeline",
            moduleTitle: "Track 3 • Module 1 • Lesson 1",
            body: `
              <p>C++ is a high-performance compiled language. All code starts at the entry point function: <code>main()</code>.</p>
              <h4>1. Compilation Flow</h4>
              <p>In standard C++, compiler drivers (like <code>g++</code> or <code>clang++</code>) run preprocessors, compilers, assemblers, and linkers to convert source code (<code>.cc</code>, <code>.cpp</code>) into executable binary machine instructions.</p>
              <pre><code>#include &lt;iostream&gt; // Preprocessor header inclusion

int main ()
{
  std::cout &lt;&lt; "Hello C++ World" &lt;&lt; std::endl;
  return 0; // Exit status 0 represents success
}</code></pre>
            `
          },
          {
            id: "T3-M1-L2",
            title: "1.2 Primitive Variables & I/O Streams",
            moduleTitle: "Track 3 • Module 1 • Lesson 2",
            body: `
              <p>C++ is statically typed, meaning variable types must be declared explicitly. Standard data types include:</p>
              <ul>
                <li><strong>int:</strong> Integer values (e.g. <code>42</code>).</li>
                <li><strong>double / float:</strong> Floating-point decimal values (e.g. <code>3.14159</code>).</li>
                <li><strong>bool:</strong> Boolean states (<code>true</code> or <code>false</code>).</li>
              </ul>
              <h4>Standard Streams</h4>
              <p>Use <code>std::cout</code> to output stream text, and <code>std::endl</code> to write a newline and flush the write buffer.</p>
            `
          },
          {
            id: "T3-M1-L3",
            title: "1.3 Control Flow & Helper Functions",
            moduleTitle: "Track 3 • Module 1 • Lesson 3",
            body: `
              <p>Control flow allows executing code conditionally or repeatedly:</p>
              <ul>
                <li><strong>if/else:</strong> Execute branches based on boolean statements.</li>
                <li><strong>for loops:</strong> Repeat block execution a set number of times.</li>
                <li><strong>while loops:</strong> Repeat block execution while a condition is satisfied.</li>
              </ul>
              <h4>Functions</h4>
              <p>Functions isolate reusable logical tasks, accepting inputs (arguments) and returning values:</p>
              <pre><code>double CalculateThroughput (double bytes, double seconds)
{
  if (seconds &lt;= 0.0) return 0.0;
  return (bytes * 8.0) / seconds; // Return value in bits per second
}</code></pre>
            `
          },
          {
            id: "T3-M1-L4",
            title: "1.4 Complete Fundamentals Example Code",
            moduleTitle: "Track 3 • Module 1 • Lesson 4",
            body: `
              <p>Below is a compilable C++ program demonstrating primitive syntax, console streams, loops, and function declarations.</p>
              
              <div class="topology-diagram" style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin: 20px 0; padding: 20px; background: rgba(15, 23, 42, 0.6); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <span style="font-size: 11px; color: #a5b4fc; font-weight: 500;">Control Loop Flowchart</span>
                <div style="display: flex; align-items: center; gap: 15px; margin-top: 5px;">
                  <div style="background: #3b82f6; border-radius: 4px; padding: 6px 12px; font-size: 11px; color: white;">Start Loop (i=0)</div>
                  <span style="color: #94a3b8;">➡️</span>
                  <div style="background: #eab308; border-radius: 4px; padding: 6px 12px; font-size: 11px; color: white;">Condition (i &lt; 5)?</div>
                  <span style="color: #94a3b8;">➡️</span>
                  <div style="background: #10b981; border-radius: 4px; padding: 6px 12px; font-size: 11px; color: white;">Execute Body / Increment i</div>
                </div>
              </div>

              <pre style="background:#05070c; padding:12px; border-radius:6px; border:1px solid var(--border-glow); overflow-x:auto;"><code style="font-family:monospace; color:#34d399; font-size:12px; white-space:pre;">#include &lt;iostream&gt;

double CalculateRate (double bits, double duration)
{
  if (duration &lt;= 0.0) return 0.0;
  return bits / duration;
}

int main ()
{
  std::cout &lt;&lt; "Starting calculation loop..." &lt;&lt; std::endl;
  double totalBits = 0.0;
  
  for (int i = 0; i &lt; 5; ++i)
  {
    totalBits += 1024.0;
  }

  double rate = CalculateRate (totalBits, 2.0);
  std::cout &lt;&lt; "Calculated transmission rate: " &lt;&lt; rate &lt;&lt; " bps" &lt;&lt; std::endl;
  return 0;
}</code></pre>
              
              <div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; padding: 12px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                <strong style="color: #a5b4fc; display: block; margin-bottom: 6px;">💡 Layman's Analogy:</strong>
                Writing a program is like writing a recipe. Statements are steps (e.g. "preheat oven to 350F"). Conditionals are choice branches ("if vegetarian, omit meat"). Loops are repetitive instructions ("beat eggs for 5 minutes"). Functions are sub-recipes referenced from the main one.
              </div>
            `
          },
          {
            id: "T3-M1-Q",
            title: "Module 1 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 3 • Module 1 • Assessment",
            quiz: [
              {
                question: "1. Which C++ stream represents console stdout output?",
                options: [
                  { text: "std::cout", isCorrect: true },
                  { text: "std::cin", isCorrect: false },
                  { text: "std::cerr", isCorrect: false }
                ],
                feedbackSuccess: "Correct! std::cout represents standard console output stream.",
                feedbackError: "Incorrect. Use std::cout to print text to standard console output. Try again!"
              },
              {
                question: "2. What is the entry point function of every C++ executable?",
                options: [
                  { text: "main()", isCorrect: true },
                  { text: "init()", isCorrect: false },
                  { text: "start()", isCorrect: false }
                ],
                feedbackSuccess: "Correct! The runtime calls main() to execute the binary.",
                feedbackError: "Incorrect. The main() function acts as the required entry point. Try again!"
              }
            ]
          },
          {
            id: "T3-M1-A",
            title: "Track 3 Module 1 Assignment",
            isAssignmentOnly: true,
            moduleTitle: "Track 3 • Module 1 • Assignment",
            assignmentInstructions: `
              <h4>Assignment Objective:</h4>
              <p>Write a basic C++ script that iterates via a loops structure and prints a summary log message. This ensures your compiler environment is correctly linked.</p>
              
              <h4>Step 1: Write and Compile Assignment</h4>
              <p>Initialize a loop from <code>0</code> up to <code>10</code>. Print exactly: <code>Compilation and fundamentals check passed.</code>.</p>
              
              <h4>Step 2: Compile and Execute in Terminal</h4>
              <p>Compile using your local compiler toolchain and run it to verify output:
              <pre><code>g++ -O2 scratch/aerowlan_exercises/cpp_module1_assignment.cc -o scratch/aerowlan_exercises/cpp_module1_assignment && ./scratch/aerowlan_exercises/cpp_module1_assignment > scratch/aerowlan_exercises/cpp_m1_output.txt 2>&1</code></pre></p>
              
              <h4>Step 3: Paste logs below to verify.</h4>
            `,
            assignmentVerifyKeyword: "Compilation and fundamentals check passed.",
            practiceFile: "scratch/aerowlan_exercises/cpp_module1_assignment.cc"
          }
        ]
      },
      {
        id: 2,
        title: "Module 2: Memory Management & Object-Oriented C++",
        description: "Pointers, reference parameters, smart pointer reference-counting, class inheritance, and virtual polymorphism.",
        lessons: [
          {
            id: "T3-M2-L1",
            title: "2.1 Memory Management: Stack, Heap & Pointers",
            moduleTitle: "Track 3 • Module 2 • Lesson 1",
            body: `
              <p>C++ allows direct memory manipulation using two target areas:</p>
              <ul>
                <li><strong>Stack:</strong> Small, fast, scope-managed storage. Variables declared here are automatically freed when the function exits.</li>
                <li><strong>Heap:</strong> Large dynamically allocated segment. Allocations must be manually managed using <code>new</code> and <code>delete</code> to prevent memory leaks.</li>
              </ul>
              <h4>Pointers and References</h4>
              <p>A pointer (<code>*</code>) stores the address of a variable in memory. A reference (<code>&</code>) is an alias for an existing variable, optimizing parameter passing without copying large structs.</p>
            `
          },
          {
            id: "T3-M2-L2",
            title: "2.2 Smart Pointers & Reference Counting",
            moduleTitle: "Track 3 • Module 2 • Lesson 2",
            body: `
              <p>To avoid memory leaks, modern C++ uses smart pointers that automatically delete objects when references drop to zero. In standard C++, we use <code>std::shared_ptr</code>.</p>
              <h4>ns-3 Smart Pointers (Ptr)</h4>
              <p>The ns-3 simulator does not use standard C++ smart pointers. Instead, it defines its own reference-counting system:</p>
              <ul>
                <li>[[Ptr]]: Reference-counting smart pointer class (e.g. <code>Ptr&lt;Node&gt;</code>).</li>
                <li>[[CreateObject]]: Instantiates an ns-3 object on the heap and returns a wrapped pointer.</li>
              </ul>
              <pre><code>Ptr&lt;Node&gt; node = CreateObject&lt;Node&gt; (); // Heap allocated and reference tracked</code></pre>
            `
          },
          {
            id: "T3-M2-L3",
            title: "2.3 Class Inheritance & Virtual Polymorphism",
            moduleTitle: "Track 3 • Module 2 • Lesson 3",
            body: `
              <p>Object-Oriented Programming (OOP) maps logical hierarchies into code:</p>
              <ul>
                <li><strong>Inheritance:</strong> Reusing properties of base classes (e.g. class <code>WifiNetDevice</code> inheriting from base class <code>NetDevice</code>).</li>
                <li><strong>Polymorphism:</strong> Overriding parent behavior using <code>virtual</code> functions.</li>
              </ul>
              <p>When a virtual method is called on a pointer to a base class, C++ queries the Virtual Table (Vtable) pointer to dispatch the subclass implementation at runtime.</p>
            `
          },
          {
            id: "T3-M2-L4",
            title: "2.4 Complete Memory & Polymorphism Example",
            moduleTitle: "Track 3 • Module 2 • Lesson 4",
            body: `
              <p>Below is a compilable C++ code example demonstrating polymorphism and pointer allocations.</p>
              
              <div class="topology-diagram" style="display: flex; flex-direction: column; align-items: center; gap: 10px; margin: 20px 0; padding: 20px; background: rgba(15, 23, 42, 0.6); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <span style="font-size: 11px; color: #a5b4fc; font-weight: 500;">Stack vs Heap Layout</span>
                <div style="display: flex; justify-content: center; gap: 20px; width: 100%; font-size: 10px; margin-top: 4px;">
                  <div style="border: 1px solid #60a5fa; background: rgba(59, 130, 246, 0.1); padding: 8px; border-radius: 4px; text-align: center; flex: 1;">
                    <strong style="color: #60a5fa; display: block; margin-bottom: 2px;">Stack (Fast / Scope-local)</strong>
                    <code>Pointer Variable (0x7ffe...)</code>
                  </div>
                  <div style="border: 1px dashed #34d399; background: rgba(16, 185, 129, 0.1); padding: 8px; border-radius: 4px; text-align: center; flex: 1;">
                    <strong style="color: #34d399; display: block; margin-bottom: 2px;">Heap (Large / Dynamically allocated)</strong>
                    <code>Class Instance Object (0x55d2...)</code>
                  </div>
                </div>
              </div>

              <pre style="background:#05070c; padding:12px; border-radius:6px; border:1px solid var(--border-glow); overflow-x:auto;"><code style="font-family:monospace; color:#34d399; font-size:12px; white-space:pre;">#include &lt;iostream&gt;

class BaseDevice
{
public:
  virtual void Transmit () {
    std::cout &lt;&lt; "Base device transmitting..." &lt;&lt; std::endl;
  }
  virtual ~BaseDevice () {} // Always define virtual destructor for base classes
};

class CustomDevice : public BaseDevice
{
public:
  void Transmit () override {
    std::cout &lt;&lt; "Custom device transmitting at high rate!" &lt;&lt; std::endl;
  }
};

int main ()
{
  // Allocate CustomDevice on the heap, accessed via base class pointer
  BaseDevice* dev = new CustomDevice ();
  dev-&gt;Transmit (); // Invokes child override using Vtable lookup!
  
  delete dev; // Free heap memory
  return 0;
}</code></pre>
              
              <div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; padding: 12px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                <strong style="color: #a5b4fc; display: block; margin-bottom: 6px;">💡 Layman's Analogy:</strong>
                A pointer is like a Post-it note where you write down someone's home address (GPS coordinates). If you want to give a package (data) to them, passing the Post-it note (pointer/reference parameter) is much faster and cheaper than duplicating their entire house (copying values).
              </div>
            `
          },
          {
            id: "T3-M2-Q",
            title: "Module 2 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 3 • Module 2 • Assessment",
            quiz: [
              {
                question: "1. Which memory region is automatically managed and cleaned when a function exits?",
                options: [
                  { text: "Stack", isCorrect: true },
                  { text: "Heap", isCorrect: false },
                  { text: "Global Static Data", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Stack variables are allocated and freed in scope order.",
                feedbackError: "Incorrect. The Stack is scope-managed, while the Heap requires explicit or smart pointer deletions. Try again!"
              },
              {
                question: "2. Why is a virtual destructor important in base classes?",
                options: [
                  { text: "To ensure the child subclass destructor is run when deleting a base class pointer", isCorrect: true },
                  { text: "To compile the file faster", isCorrect: false },
                  { text: "To make constructors run automatically", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Virtual destructors prevent subclass memory leaks during dynamic deallocations.",
                feedbackError: "Incorrect. Virtual destructors guarantee correct teardown paths for derived subclasses. Try again!"
              }
            ]
          },
          {
            id: "T3-M2-A",
            title: "Track 3 Module 2 Assignment",
            isAssignmentOnly: true,
            moduleTitle: "Track 3 • Module 2 • Assignment",
            assignmentInstructions: `
              <h4>Assignment Objective:</h4>
              <p>Write an object-oriented C++ script declaring a virtual subclass, overriding base methods, and verifying runtime polymorphism execution logs.</p>
              
              <h4>Step 1: Write polymorphism script</h4>
              <p>Declare a base class <code>Parent</code> and child subclass <code>Child</code> overriding a virtual function. Output: <code>Polymorphic class execution checked.</code>.</p>
              
              <h4>Step 2: Compile and Run</h4>
              <p>Compile and run locally:
              <pre><code>g++ -O2 scratch/aerowlan_exercises/cpp_module2_assignment.cc -o scratch/aerowlan_exercises/cpp_module2_assignment && ./scratch/aerowlan_exercises/cpp_module2_assignment > scratch/aerowlan_exercises/cpp_m2_output.txt 2>&1</code></pre></p>
              
              <h4>Step 3: Paste logs below to verify.</h4>
            `,
            assignmentVerifyKeyword: "Polymorphic class execution checked.",
            practiceFile: "scratch/aerowlan_exercises/cpp_module2_assignment.cc"
          }
        ]
      },
      {
        id: 3,
        title: "Module 3: Templates, Namespaces & Callback Events",
        description: "Avoiding symbol name collisions with namespaces, generic programming via templates, and function pointer event connections.",
        lessons: [
          {
            id: "T3-M3-L1",
            title: "3.1 Namespaces & Scoping",
            moduleTitle: "Track 3 • Module 3 • Lesson 1",
            body: `
              <p>In large software packages, name collisions occur when different libraries declare classes with identical identifiers. C++ uses **Namespaces** to prevent this.</p>
              <h4>Using Scope Operators</h4>
              <p>Use the scope resolution operator <code>::</code> to specify which namespace a symbol belongs to (e.g. <code>ns3::WifiHelper</code> or <code>std::cout</code>). The statement <code>using namespace ns3;</code> allows omitting the namespace prefix in C++ source files.</p>
            `
          },
          {
            id: "T3-M3-L2",
            title: "3.2 Templates & Generic Programming",
            moduleTitle: "Track 3 • Module 3 • Lesson 2",
            body: `
              <p>Templates allow writing code once that works with multiple types. This is essential for containers and generic helpers.</p>
              <pre><code>template &lt;typename T&gt;
T Max (T a, T b)
{
  return (a &gt; b) ? a : b;
}</code></pre>
              <p>The compiler automatically instantiates separate versions of the function during build time depending on the types passed (e.g. <code>Max&lt;double&gt; (3.0, 5.5)</code>).</p>
            `
          },
          {
            id: "T3-M3-L3",
            title: "3.3 Callbacks & Function Object Pointers",
            moduleTitle: "Track 3 • Module 3 • Lesson 3",
            body: `
              <p>A callback is a pointer to a function passed to another module. It allows objects to trigger notification events dynamically.</p>
              <h4>ns-3 Callbacks</h4>
              <p>Standard C++ uses function pointers or <code>std::function</code>. The ns-3 engine implements a custom type-safe [[Callback]] template class. Sinks register callbacks that map directly to trace sources, enabling dynamic event notification routing without hard-coded dependencies.</p>
            `
          },
          {
            id: "T3-M3-L4",
            title: "3.4 Complete Generic Callback Example",
            moduleTitle: "Track 3 • Module 3 • Lesson 4",
            body: `
              <p>Below is a compilable C++ code example establishing a template function and binding a dynamic callback variable.</p>
              
              <div class="topology-diagram" style="display: flex; flex-direction: column; align-items: center; gap: 10px; margin: 20px 0; padding: 20px; background: rgba(15, 23, 42, 0.6); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <span style="font-size: 11px; color: #a5b4fc; font-weight: 500;">Callback Linkage Structure</span>
                <div style="width: 100%; border: 1px solid rgba(236, 72, 153, 0.4); background: rgba(236, 72, 153, 0.05); padding: 8px; border-radius: 6px; text-align: center; font-size: 10px; color: #f472b6;">
                  🎯 Event Trigger (m_callback) ➡️ 📞 Registered Callback Sink Function (IntTrace)
                </div>
              </div>

              <pre style="background:#05070c; padding:12px; border-radius:6px; border:1px solid var(--border-glow); overflow-x:auto;"><code style="font-family:monospace; color:#34d399; font-size:12px; white-space:pre;">#include &lt;iostream&gt;

// Generic template printer
template &lt;typename T&gt;
void PrintValue (T value)
{
  std::cout &lt;&lt; "Template value output: " &lt;&lt; value &lt;&lt; std::endl;
}

// Function pointer typedef for a void callback taking an integer
typedef void (*ActionCallback)(int);

class EventSource
{
public:
  void SetCallback (ActionCallback cb) {
    m_callback = cb;
  }
  void Trigger (int val) {
    if (m_callback) m_callback (val);
  }
private:
  ActionCallback m_callback = nullptr;
};

void CustomSink (int eventVal)
{
  std::cout &lt;&lt; "Event received in custom sink with value: " &lt;&lt; eventVal &lt;&lt; std::endl;
}

int main ()
{
  PrintValue&lt;double&gt; (42.5); // Instantiates double template
  
  EventSource src;
  src.SetCallback (&amp;CustomSink); // Bind function pointer
  src.Trigger (100);             // Fires CustomSink callback!
  
  return 0;
}</code></pre>
              
              <div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; padding: 12px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                <strong style="color: #a5b4fc; display: block; margin-bottom: 6px;">💡 Layman's Analogy:</strong>
                A callback is like signing up for an SMS delivery alert. You give the delivery company your phone number (the function pointer address). You don't have to keep calling them to ask if the package arrived; they simply dial your number (invoke the callback) as soon as the delivery occurs.
              </div>
            `
          },
          {
            id: "T3-M3-Q",
            title: "Module 3 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 3 • Module 3 • Assessment",
            quiz: [
              {
                question: "1. What is the scope resolution operator in C++?",
                options: [
                  { text: "::", isCorrect: true },
                  { text: ".", isCorrect: false },
                  { text: "->", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Double colon (::) is the C++ scope resolution operator.",
                feedbackError: "Incorrect. Double colon (::) resolved names within scopes. Try again!"
              },
              {
                question: "2. How does template generation affect compiler tasks?",
                options: [
                  { text: "It generates separate version of class/function code at compile time depending on instantiation types", isCorrect: true },
                  { text: "It runs the code dynamically at execution time", isCorrect: false },
                  { text: "It deletes duplicate functions automatically", isCorrect: false }
                ],
                feedbackSuccess: "Correct! The compiler instantiates unique templates per type at build time.",
                feedbackError: "Incorrect. Templates are instantiated at compile time based on the types requested. Try again!"
              }
            ]
          },
          {
            id: "T3-M3-A",
            title: "Track 3 Module 3 Assignment",
            isAssignmentOnly: true,
            moduleTitle: "Track 3 • Module 3 • Assignment",
            assignmentInstructions: `
              <h4>Assignment Objective:</h4>
              <p>Write a templated function in C++ that processes generic values and prints compilation verification trace messages.</p>
              
              <h4>Step 1: Write template callback script</h4>
              <p>Declare a template function that prints exactly: <code>Generic template and event callback check passed.</code>.</p>
              
              <h4>Step 2: Compile and Run</h4>
              <p>Compile and run:
              <pre><code>g++ -O2 scratch/aerowlan_exercises/cpp_module3_assignment.cc -o scratch/aerowlan_exercises/cpp_module3_assignment && ./scratch/aerowlan_exercises/cpp_module3_assignment > scratch/aerowlan_exercises/cpp_m3_output.txt 2>&1</code></pre></p>
              
              <h4>Step 3: Paste logs below to verify.</h4>
            `,
            assignmentVerifyKeyword: "Generic template and event callback check passed.",
            practiceFile: "scratch/aerowlan_exercises/cpp_module3_assignment.cc"
          }
        ]
      }
    ]
  }
];

function preprocessTracks() {
  const track1 = tracks[0];
  track1.modules.forEach(mod => {
    if (mod.id >= 5 && mod.id <= 10) {
      const oldId = mod.id;
      const newId = oldId - 3;
      mod.id = newId;
      mod.title = mod.title.replace(`Module ${oldId}:`, `Module ${newId}:`);
      
      mod.lessons.forEach(les => {
        les.id = les.id.replace(new RegExp(`T1-M${oldId}`, 'g'), `T1-M${newId}`);
        les.moduleTitle = les.moduleTitle.replace(new RegExp(`Module ${oldId}`, 'g'), `Module ${newId}`);
        if (les.title) {
          les.title = les.title.replace(new RegExp(`Module ${oldId}`, 'g'), `Module ${newId}`);
          les.title = les.title.replace(new RegExp(`${oldId}\\.`, 'g'), `${newId}.`);
        }
      });
    }
  });
}

// Convert code blocks inside assignment instructions into styled boxes
function formatAssignmentInstructions(html) {
  if (!html) return '';
  let formatted = html.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, (match, cmd) => {
    const trimmedCmd = cmd.trim();
    const escapedCmd = trimmedCmd.replace(/'/g, "\\'").replace(/"/g, "&quot;");
    return `
      <div class="assignment-cmd-container">
        <div class="assignment-cmd-label">Terminal Command</div>
        <div class="assignment-cmd-box">
          <code>${trimmedCmd}</code>
          <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('${escapedCmd}')">Copy</button>
        </div>
      </div>
    `;
  });
  return formatted;
}

// Parse Obsidian-style [[WikiLinks]] to glossary tags
function parseWikiLinks(text) {
  if (!text) return '';
  return text.replace(/\[\[(.*?)\]\]/g, (match, term) => {
    return `<span class="wiki-link" onclick="showGlossary('${term}')">${term}</span>`;
  });
}

// Theme Toggle State management
function initTheme() {
  const body = document.body;
  body.classList.remove('light-theme');
  localStorage.setItem('obsidian_theme', 'dark');
}

window.toggleTheme = function() {
  // Enforced dark theme
};

const glossaryDb = {
  "NodeContainer": {
    title: "NodeContainer",
    desc: "A class in ns-3 that holds a collection of <code>Ptr&lt;Node&gt;</code> pointers. It is the standard helper class used to create, organize, and reference nodes in network topologies.",
    usage: "NodeContainer nodes;\nnodes.Create (4); // Instantiates 4 nodes"
  },
  "Node": {
    title: "Node",
    desc: "Represents a basic computing host or network device in ns-3 (analogous to a host computer or router). Applications, net devices, and protocol stacks are installed on nodes.",
    usage: "Ptr<Node> node = nodes.Get (0); // Retrieve pointer to the first node"
  },
  "PointToPointHelper": {
    title: "PointToPointHelper",
    desc: "A helper class used to create a point-to-point channel and configure the transmission characteristics (DataRate, Delay) of point-to-point network devices installed on nodes.",
    usage: "PointToPointHelper p2p;\np2p.SetDeviceAttribute (\"DataRate\", StringValue (\"10Mbps\"));\np2p.SetChannelAttribute (\"Delay\", StringValue (\"5ms\"));\nNetDeviceContainer devices = p2p.Install (nodes);"
  },
  "CsmaHelper": {
    title: "CsmaHelper",
    desc: "A helper class that configures and installs CSMA (Carrier Sense Multiple Access) network devices and channels. This simulates an Ethernet-like bus topology linking multiple nodes on a single shared channel.",
    usage: "CsmaHelper csma;\ncsma.SetChannelAttribute (\"DataRate\", StringValue (\"100Mbps\"));\ncsma.SetChannelAttribute (\"Delay\", TimeValue (NanoSeconds (6560)));\nNetDeviceContainer devices = csma.Install (nodes);"
  },
  "WifiHelper": {
    title: "WifiHelper",
    desc: "The primary orchestrator class for configuring and installing wireless network devices on nodes. It configures wifi standards (e.g. 802.11n, 802.11ac, 802.11ax, 802.11be) and rate control managers.",
    usage: "WifiHelper wifi;\nwifi.SetStandard (WIFI_STANDARD_80211be);\nwifi.SetRemoteStationManager (\"ns3::ConstantRateWifiManager\");"
  },
  "YansWifiPhyHelper": {
    title: "YansWifiPhyHelper",
    desc: "Configures physical layer parameters for the Yans propagation loss and delay models (Yet Another Network Simulator). Used to model classic, non-spectrum wireless channels.",
    usage: "YansWifiChannelHelper channel = YansWifiChannelHelper::Default ();\nYansWifiPhyHelper phy;\nphy.SetChannel (channel.Create ());"
  },
  "SpectrumWifiPhyHelper": {
    title: "SpectrumWifiPhyHelper",
    desc: "Configures physical layer parameters for spectrum-based channel models. Necessary for modeling complex, overlapping bands, multi-link operation (MLO) in WiFi 7, and frequency selectivity.",
    usage: "SpectrumWifiPhyHelper phy (2); // Init for 2 links\nphy.Set (0, \"ChannelSettings\", StringValue (\"{0, 20, BAND_5GHZ, 0}\"));"
  },
  "WifiMacHelper": {
    title: "WifiMacHelper",
    desc: "Configures the wireless MAC layer (Media Access Control) type (AP mode, Station mode, Ad-Hoc, or Mesh) and attributes (such as SSIDs or QoS settings) before installation.",
    usage: "WifiMacHelper mac;\nSsid ssid = Ssid (\"lab-wifi\");\nmac.SetType (\"ns3::StaWifiMac\", \"Ssid\", SsidValue (ssid));"
  },
  "MobilityHelper": {
    title: "MobilityHelper",
    desc: "Configures and installs spatial positions and mobility behaviors on nodes. This represents static physical coordinates or dynamic paths (e.g., random walk, waypoint routing) for wireless simulations.",
    usage: "MobilityHelper mobility;\nmobility.SetPositionAllocator (\"ns3::GridPositionAllocator\", ...);\nmobility.SetMobilityModel (\"ns3::ConstantPositionMobilityModel\");\nmobility.Install (nodes);"
  },
  "InternetStackHelper": {
    title: "InternetStackHelper",
    desc: "Installs protocol stacks (IPv4, IPv6, TCP, UDP, ARP) on nodes. Essential for any layer-3 simulation involving routing or IP-based sockets.",
    usage: "InternetStackHelper internet;\ninternet.Install (nodes);"
  },
  "Ipv4AddressHelper": {
    title: "Ipv4AddressHelper",
    desc: "Assigns IPv4 addresses to interfaces of net devices installed on nodes. It handles network subnet allocation and increments IP addresses automatically.",
    usage: "Ipv4AddressHelper address;\naddress.SetBase (\"192.168.1.0\", \"255.255.255.0\");\nIpv4InterfaceContainer interfaces = address.Assign (devices);"
  },
  "NetDevice": {
    title: "NetDevice",
    desc: "A base class representing a network interface card (NIC) driver and physical layer controller in ns-3. It connects a Node to a Channel to enable packet transmission.",
    usage: "NetDeviceContainer devices = p2p.Install (nodes);\nPtr<NetDevice> device = devices.Get (0);"
  },
  "Channel": {
    title: "Channel",
    desc: "A base class representing a physical transmission medium (like Ethernet cables or open air frequency spectrums) linking simulated devices.",
    usage: "Ptr<Channel> channel = device->GetChannel ();"
  },
  "WifiNetDevice": {
    title: "WifiNetDevice",
    desc: "A specialized <code>NetDevice</code> subclass implementing the IEEE 802.11 (WiFi) model in ns-3. It links a node's internet stack to a physical channel via a designated wireless MAC and PHY layer setup.",
    usage: "Ptr<WifiNetDevice> wifiDevice = CreateObject<WifiNetDevice> ();\nwifiDevice->SetPhy (phy);\nwifiDevice->SetMac (mac);\nnode->AddDevice (wifiDevice);"
  },
  "Ssid": {
    title: "Ssid",
    desc: "Represents a Service Set Identifier (network name) in wireless simulations. Station nodes associate only with Access Points (APs) broadcasting the matching SSID.",
    usage: "Ssid ssid = Ssid (\"Tesla-WiFi-7\");\nmac.SetType (\"ns3::StaWifiMac\", \"Ssid\", SsidValue (ssid));"
  },
  "EhtPhy": {
    title: "EhtPhy",
    desc: "The Extremely High Throughput (EHT) physical layer model in ns-3. It implements 802.11be (WiFi 7) specifications, handling multi-subcarrier Power Spectral Density (PSD), 320 MHz bandwidths, and 4096-QAM modulation.",
    usage: "// Configured automatically under WifiHelper when standard is 802.11be\nWifiHelper wifi;\nwifi.SetStandard (WIFI_STANDARD_80211be);"
  },
  "EhtFrameExchangeManager": {
    title: "EhtFrameExchangeManager",
    desc: "A MAC-level coordinator introduced in WiFi 7 (802.11be) to manage Extremely High Throughput frame flows, handling aggregation (A-MPDU/A-MSDU) and Multi-Link transmission schedules.",
    usage: "// Initialized automatically inside EhtWifiMac when standard is set to WIFI_STANDARD_80211be"
  },
  "MLO": {
    title: "MLO (Multi-Link Operation)",
    desc: "A core WiFi 7 feature enabling a Multi-Link Device (MLD) to transmit and receive concurrently across multiple distinct bands or channels (e.g. 5 GHz + 6 GHz). It improves throughput and offers latency protection.",
    usage: "SpectrumWifiPhyHelper phy (2); // Set up 2 links\nphy.Set (0, \"ChannelSettings\", StringValue (\"{0, 40, BAND_5GHZ, 0}\"));\nphy.Set (1, \"ChannelSettings\", StringValue (\"{0, 80, BAND_6GHZ, 0}\"));"
  },
  "COSR": {
    title: "COSR (Coordinated Spatial Reuse)",
    desc: "An advanced WiFi 8 (802.11bn Ultra High Reliability) candidate feature. Neighboring Access Points (APs) cooperate in adjusting transmit power to permit concurrent overlapping frequency transmissions without colliding.",
    usage: "// Set CCA sensitivity and power adjustments for overlapping cells\nConfig::SetDefault (\"ns3::WifiPhy::CcaSensitivityThreshold\", DoubleValue (-82.0));"
  },
  "UhrPhy": {
    title: "UhrPhy",
    desc: "Ultra High Reliability (UHR) research physical layer model representing WiFi 8 (802.11bn) features in ns-3 simulations. Subclasses EHT classes to prototype multi-AP scheduling and latency improvements.",
    usage: "// Used in advanced research scripts extending EhtPhy:\n// Ptr<UhrPhy> phy = CreateObject<UhrPhy> ();"
  },
  "OnOffHelper": {
    title: "OnOffHelper",
    desc: "A helper class that configures traffic applications switching between active transmission ('On') and idle ('Off') states. Useful for modeling bursty web traffic or VoIP.",
    usage: "OnOffHelper client (\"ns3::UdpSocketFactory\", Address (sinkAddress));\nclient.SetAttribute (\"OnTime\", StringValue (\"ns3::ConstantRandomVariable[Constant=1.0]\"));\nclient.SetAttribute (\"OffTime\", StringValue (\"ns3::ConstantRandomVariable[Constant=2.0]\"));\nApplicationContainer clientApps = client.Install (clientNode);"
  },
  "PacketSinkHelper": {
    title: "PacketSinkHelper",
    desc: "An application helper that installs a packet sink on a node to receive network traffic. Perfect for measuring throughput, packet delivery ratio, and delay statistics.",
    usage: "PacketSinkHelper sink (\"ns3::UdpSocketFactory\", Address (sinkAddress));\nApplicationContainer sinkApps = sink.Install (sinkNode);\nsinkApps.Start (Seconds (0.0));"
  },
  "YansWifiChannelHelper": {
    title: "YansWifiChannelHelper",
    desc: "A helper that creates wireless channels modeling classic path loss (Friis/LogDistance) and speed of light delays, abstracting away complex multi-link spectrum interference.",
    usage: "YansWifiChannelHelper channel = YansWifiChannelHelper::Default ();\nYansWifiPhyHelper phy;\nphy.SetChannel (channel.Create ());"
  },
  "MultiUserScheduler": {
    title: "MultiUserScheduler",
    desc: "A MAC-layer component introduced in 802.11ax and enhanced in 802.11be. It runs on Access Points to dynamically allocate OFDMA Resource Units (RUs) among connected stations.",
    usage: "// Configured via AP WifiMac attributes:\nmac.SetType (\"ns3::ApWifiMac\", \"MultiUserScheduler\", TypeIdValue (MultiUserScheduler::GetTypeId ()));"
  },
  "CommandLine": {
    title: "CommandLine",
    desc: "A core utility class in ns-3 used to declare, parse, and process command-line arguments to customize simulation behaviors dynamically at run time.",
    usage: "CommandLine cmd (__FILE__);\ncmd.AddValue (\"nodeCount\", \"Nodes count\", nodeCount);\ncmd.Parse (argc, argv);"
  },
  "RateErrorModel": {
    title: "RateErrorModel",
    desc: "An error model used in ns-3 to evaluate channel error rates. It drops incoming packets based on a probability distribution over packets or bytes.",
    usage: "Ptr<RateErrorModel> em = CreateObject<RateErrorModel> ();\nem->SetAttribute (\"ErrorRate\", DoubleValue (0.05));\ndevices.Get (1)->SetAttribute (\"ReceiveErrorModel\", ObjectValue (em));"
  },
  "TraceConnectWithoutContext": {
    title: "TraceConnectWithoutContext",
    desc: "A method on ns-3 objects that links a trace source (like <code>MacTx</code> or <code>PhyTxBegin</code>) directly to a user-defined callback function, without prefixing trace context details.",
    usage: "devices.Get (0)->TraceConnectWithoutContext (\"MacTx\", MakeCallback (&TxCallback));"
  }
};

window.showGlossary = function(term) {
  const item = glossaryDb[term];
  if (!item) return;

  const modal = document.getElementById('glossary-modal');
  const title = document.getElementById('glossary-modal-title');
  const body = document.getElementById('glossary-modal-body');

  if (modal && title && body) {
    title.innerText = item.title;
    body.innerHTML = `
      <p>${item.desc}</p>
      <h4 style="margin-top:14px; font-weight:600; font-size:11px; text-transform:uppercase; color:var(--text-muted);">C++ Code Snippet</h4>
      <pre style="background:rgba(0,0,0,0.15); padding:10px; border-radius:6px; border:1px solid var(--border-glow); margin-top:6px;"><code style="font-family:monospace; font-size:12px; color:#34d399; white-space:pre-wrap;">${item.usage}</code></pre>
    `;
    modal.classList.add('active');
  }
};

window.closeGlossary = function(event) {
  if (event && event.target) {
    const clickedOverlay = event.target.id === 'glossary-modal';
    const clickedCloseBtn = event.target.classList.contains('modal-close-btn') || event.target.closest('.modal-close-btn');
    if (!clickedOverlay && !clickedCloseBtn) {
      return;
    }
  }
  const modal = document.getElementById('glossary-modal');
  if (!modal) return;
  modal.classList.remove('active');
};

// Initialize Dashboard & Learning Hub
function init() {
  preprocessTracks();
  initTheme();
  renderMilestones();
  renderSyllabus();
  loadLesson(currentModuleIndex, currentLessonIndex);
  updateProgressBar();
  initCodingLab();
  lucide.createIcons();
}

// Check if a lesson is locked (cannot skip modules)
function isLessonLocked(mIdx, lIdx) {
  return false;
}

// Render Milestones based on current Track
function renderMilestones() {
  const container = document.getElementById('dashboard-milestones');
  if (!container) return;
  container.innerHTML = '';

  const activeTrack = tracks[currentTrackIndex];
  document.getElementById('overall-progress-text').innerText = activeTrack.name;

  activeTrack.modules.forEach((mod, mIdx) => {
    let statusClass = '';
    let statusLabel = 'Locked';

    const completedCount = mod.lessons.filter(l => progress.completedLessons.includes(l.id)).length;
    const isModuleCompleted = (completedCount === mod.lessons.length);
    const isLocked = isLessonLocked(mIdx, 0);

    if (isModuleCompleted) {
      statusClass = 'completed';
      statusLabel = 'Completed';
    } else if (!isLocked) {
      statusClass = 'active';
      statusLabel = 'In Progress';
    }

    const item = document.createElement('div');
    item.className = 'milestone-item';
    item.innerHTML = `
      <div class="milestone-info">
        <div class="milestone-num ${statusClass === 'completed' ? 'completed' : (statusClass === 'active' ? 'active' : '')}">
          ${mod.id}
        </div>
        <div class="milestone-desc">
          <h4>${mod.title}</h4>
          <p>${mod.description}</p>
        </div>
      </div>
      <span class="badge ${statusClass === 'completed' ? 'green' : (statusClass === 'active' ? 'blue' : 'purple')}">${statusLabel}</span>
    `;
    container.appendChild(item);
  });
}

// Render Syllabus Menu
function renderSyllabus() {
  const container = document.getElementById('syllabus-menu');
  if (!container) return;
  container.innerHTML = '';

  const activeTrack = tracks[currentTrackIndex];

  // Auto-expand the active module
  if (expandedModules[currentModuleIndex] === undefined) {
    expandedModules[currentModuleIndex] = true;
  }

  activeTrack.modules.forEach((mod, mIdx) => {
    const modHeader = document.createElement('div');
    modHeader.className = 'syllabus-module-header';
    modHeader.style.cursor = 'pointer';
    modHeader.style.display = 'flex';
    modHeader.style.justifyContent = 'space-between';
    modHeader.style.alignItems = 'center';
    modHeader.style.fontWeight = 'bold';
    modHeader.style.fontSize = '12px';
    modHeader.style.color = '#cbd5e1';
    modHeader.style.marginTop = mIdx > 0 ? '12px' : '0';
    modHeader.style.marginBottom = '6px';
    modHeader.style.padding = '8px 10px';
    modHeader.style.borderRadius = '6px';
    modHeader.style.background = 'rgba(255, 255, 255, 0.03)';
    modHeader.style.border = '1px solid rgba(255, 255, 255, 0.05)';
    modHeader.style.transition = 'all 0.2s ease';
    
    const isExpanded = expandedModules[mIdx] || false;
    modHeader.innerHTML = `
      <span>${mod.title}</span>
      <span style="font-size: 9px; color: #94a3b8; transition: transform 0.2s; transform: ${isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'}">▶</span>
    `;
    
    modHeader.onclick = () => {
      expandedModules[mIdx] = !isExpanded;
      renderSyllabus();
    };
    container.appendChild(modHeader);

    if (isExpanded) {
      mod.lessons.forEach((les, lIdx) => {
        const item = document.createElement('div');
        const isActive = (mIdx === currentModuleIndex && lIdx === currentLessonIndex);
        const isCompleted = progress.completedLessons.includes(les.id);
        const isLocked = isLessonLocked(mIdx, lIdx);

        item.className = `syllabus-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;
        
        let prefix = `L${les.id.split('-L')[1] || lIdx + 1}: `;
        if (les.isQuizOnly) prefix = '📝 ';
        if (les.isAssignmentOnly) prefix = '💻 ';
        
        item.innerHTML = `
          <span>${isLocked ? '🔒 ' : ''}${prefix}${les.title}</span>
          ${isCompleted ? '<span>✓</span>' : ''}
        `;
        
        if (!isLocked) {
          item.onclick = (e) => {
            e.stopPropagation();
            selectLesson(mIdx, lIdx);
          };
        } else {
          item.style.opacity = '0.5';
          item.style.cursor = 'not-allowed';
        }
        container.appendChild(item);
      });
    }
  });
}

// Load Lesson Content
function loadLesson(mIdx, lIdx) {
  currentModuleIndex = mIdx;
  currentLessonIndex = lIdx;

  const activeTrack = tracks[currentTrackIndex];
  const lesson = activeTrack.modules[mIdx].lessons[lIdx];
  
  document.getElementById('lesson-module-tag').innerText = lesson.moduleTitle;
  document.getElementById('lesson-title').innerText = lesson.title;
  
  const bodyElement = document.getElementById('lesson-body');
  const practiceBox = document.getElementById('practice-box');
  const quizBlock = document.getElementById('quiz-block');
  const assignmentBlock = document.getElementById('assignment-block');

  // Reset inputs
  document.getElementById('assignment-output-paste').value = '';
  document.getElementById('assignment-feedback').style.display = 'none';

  if (lesson.isQuizOnly) {
    bodyElement.innerHTML = `<p>This is the final assessment for this module. You must answer all 5 questions correctly to verify your understanding and proceed to the programming assignment.</p>
                             <div id="quiz-summary-state" style="margin-top: 10px; font-weight: 600; color: #fdba74;">
                               Question ${currentQuizQuestionIndex + 1} of ${lesson.quiz.length}
                             </div>`;
    practiceBox.style.display = 'none';
    assignmentBlock.style.display = 'none';
    quizBlock.style.display = 'block';
    
    loadQuizQuestion(lesson.quiz[currentQuizQuestionIndex]);
  } else if (lesson.isAssignmentOnly) {
    bodyElement.innerHTML = `<p>Complete the practical programming challenge below. Execute the simulation in your terminal and submit the stdout logs to verify your code correctness and unlock the next module.</p>`;
    quizBlock.style.display = 'none';
    practiceBox.style.display = 'none';
    assignmentBlock.style.display = 'block';
    
    let formattedHtml = formatAssignmentInstructions(lesson.assignmentInstructions);
    document.getElementById('assignment-instructions').innerHTML = parseWikiLinks(formattedHtml);
  } else {
    bodyElement.innerHTML = parseWikiLinks(lesson.body);
    quizBlock.style.display = 'none';
    assignmentBlock.style.display = 'none';
    
    if (lesson.practiceFile) {
      practiceBox.style.display = 'block';
      practiceBox.innerHTML = `
        <h4>💻 Practice Exercise</h4>
        <p>Open the practice C++ file in your workspace:</p>
        <div class="file-path-row">
          <code id="practice-file-path">${lesson.practiceFile}</code>
          <button class="btn btn-secondary btn-sm" onclick="copyFilePath()">Copy Path</button>
        </div>
        <p class="mt-3">Compile and run this file using your terminal:</p>
        <div class="terminal-command-row">
          <code id="practice-command">${lesson.practiceCmd}</code>
          <button class="btn btn-secondary btn-sm" onclick="copyCommand()">Copy Command</button>
        </div>
      `;
    } else {
      practiceBox.style.display = 'none';
    }
  }

  // Enable/disable navigation buttons
  document.getElementById('btn-prev-lesson').disabled = (mIdx === 0 && lIdx === 0);
  const isLastLesson = (mIdx === activeTrack.modules.length - 1 && lIdx === activeTrack.modules[mIdx].lessons.length - 1);
  document.getElementById('btn-next-lesson').disabled = isLastLesson;
}

// Load a specific question from quiz
function loadQuizQuestion(qObj) {
  document.getElementById('quiz-question').innerText = qObj.question;
  const optionsContainer = document.getElementById('quiz-options');
  optionsContainer.innerHTML = '';
  const feedbackContainer = document.getElementById('quiz-feedback');
  feedbackContainer.style.display = 'none';

  qObj.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = opt.text;
    btn.onclick = () => submitAnswer(opt, btn, qObj);
    optionsContainer.appendChild(btn);
  });
}

// Select a lesson manually from sidebar
function selectLesson(mIdx, lIdx) {
  currentQuizQuestionIndex = 0;
  quizAnswersCorrect = 0;
  loadLesson(mIdx, lIdx);
  renderSyllabus();
}

// Track changer
function changeTrack() {
  const select = document.getElementById('track-selector');
  currentTrackIndex = parseInt(select.value);
  currentModuleIndex = 0;
  currentLessonIndex = 0;
  currentQuizQuestionIndex = 0;
  quizAnswersCorrect = 0;
  
  init();
}

// Copy helpers
function copyFilePath() {
  const text = document.getElementById('practice-file-path').innerText;
  navigator.clipboard.writeText(text);
}

function copyCommand() {
  const text = document.getElementById('practice-command').innerText;
  navigator.clipboard.writeText(text);
}

// Submit Quiz Answer
function submitAnswer(option, element, qObj) {
  const feedbackContainer = document.getElementById('quiz-feedback');
  const optionButtons = document.querySelectorAll('.option-btn');

  optionButtons.forEach(btn => btn.classList.remove('correct', 'wrong'));

  const activeTrack = tracks[currentTrackIndex];
  const lesson = activeTrack.modules[currentModuleIndex].lessons[currentLessonIndex];

  if (option.isCorrect) {
    element.classList.add('correct');
    feedbackContainer.className = 'quiz-feedback success';
    feedbackContainer.innerHTML = `<span>✓</span> ${qObj.feedbackSuccess}`;
    feedbackContainer.style.display = 'flex';

    quizAnswersCorrect++;

    // Next Question flow
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary mt-3';
    
    const isLastQuestion = (currentQuizQuestionIndex === lesson.quiz.length - 1);
    nextBtn.innerText = isLastQuestion ? "Complete Assessment" : "Next Question";
    
    nextBtn.onclick = () => {
      if (isLastQuestion) {
        if (!progress.completedLessons.includes(lesson.id)) {
          progress.completedLessons.push(lesson.id);
          localStorage.setItem('tesla_netsim_progress', JSON.stringify(progress));
          updateProgressBar();
          renderMilestones();
          renderSyllabus();
        }
        
        // Show success screen and advance to programming test automatically
        document.getElementById('lesson-body').innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <h2 style="color: #10b981;">🎉 Quiz Passed!</h2>
            <p style="margin-top: 10px;">You solved all ${quizAnswersCorrect}/${lesson.quiz.length} questions correctly.</p>
            <p style="margin-top: 10px;"><strong>Next up:</strong> Programming Practical Assignment.</p>
            <button class="btn btn-primary mt-4" onclick="nextLesson()">Go to Programming Assignment</button>
          </div>
        `;
        document.getElementById('quiz-block').style.display = 'none';
      } else {
        currentQuizQuestionIndex++;
        loadLesson(currentModuleIndex, currentLessonIndex);
      }
    };
    feedbackContainer.appendChild(document.createElement('br'));
    feedbackContainer.appendChild(nextBtn);

  } else {
    element.classList.add('wrong');
    feedbackContainer.className = 'quiz-feedback error';
    feedbackContainer.innerHTML = `<span>✗</span> ${qObj.feedbackError}`;
    feedbackContainer.style.display = 'flex';
  }
}

// Verify Programming Assignment
function verifyAssignment() {
  const pasteVal = document.getElementById('assignment-output-paste').value.trim();
  const feedbackContainer = document.getElementById('assignment-feedback');
  const activeTrack = tracks[currentTrackIndex];
  const lesson = activeTrack.modules[currentModuleIndex].lessons[currentLessonIndex];
  
  if (!pasteVal) {
    feedbackContainer.className = "quiz-feedback error";
    feedbackContainer.innerHTML = `<span>✗</span> Output is empty! Please run the commands in your terminal and paste the logs.`;
    feedbackContainer.style.display = 'flex';
    return;
  }

  // Check if target keyword is present in output
  const keyword = lesson.assignmentVerifyKeyword;
  if (pasteVal.toLowerCase().includes(keyword.toLowerCase())) {
    feedbackContainer.className = "quiz-feedback success";
    feedbackContainer.innerHTML = `<span>✓</span> <strong>Verification Successful!</strong> Target output trace found. The programming assignment is completed.`;
    feedbackContainer.style.display = 'flex';

    if (!progress.completedLessons.includes(lesson.id)) {
      progress.completedLessons.push(lesson.id);
      localStorage.setItem('tesla_netsim_progress', JSON.stringify(progress));
      updateProgressBar();
      renderMilestones();
      renderSyllabus();
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary mt-3';
    nextBtn.innerText = "Unlock Next Module";
    nextBtn.onclick = () => {
      nextLesson();
    };
    feedbackContainer.appendChild(document.createElement('br'));
    feedbackContainer.appendChild(nextBtn);
  } else {
    feedbackContainer.className = "quiz-feedback error";
    feedbackContainer.innerHTML = `<span>✗</span> <strong>Verification Failed!</strong> The pasted output does not contain the expected verification trace: <code>"${keyword}"</code>. Please check your modifications and try again.`;
    feedbackContainer.style.display = 'flex';
  }
}

// Update progress bar percentage
function updateProgressBar() {
  let totalLessons = 0;
  tracks.forEach(track => {
    track.modules.forEach(m => totalLessons += m.lessons.length);
  });
  
  const completedCount = progress.completedLessons.length;
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const bar = document.getElementById('overall-progress-bar');
  const text = document.getElementById('overall-progress-text');
  if (bar) bar.style.width = `${pct}%`;
  if (text) text.innerText = `${pct}% of all tracks completed`;
}

// Next/Prev Navigation
function prevLesson() {
  currentQuizQuestionIndex = 0;
  quizAnswersCorrect = 0;

  const activeTrack = tracks[currentTrackIndex];
  if (currentLessonIndex > 0) {
    loadLesson(currentModuleIndex, currentLessonIndex - 1);
  } else if (currentModuleIndex > 0) {
    const prevMod = activeTrack.modules[currentModuleIndex - 1];
    loadLesson(currentModuleIndex - 1, prevMod.lessons.length - 1);
  }
  renderSyllabus();
}

function nextLesson() {
  currentQuizQuestionIndex = 0;
  quizAnswersCorrect = 0;

  const activeTrack = tracks[currentTrackIndex];
  const currentMod = activeTrack.modules[currentModuleIndex];
  if (currentLessonIndex < currentMod.lessons.length - 1) {
    loadLesson(currentModuleIndex, currentLessonIndex + 1);
  } else if (currentModuleIndex < activeTrack.modules.length - 1) {
    loadLesson(currentModuleIndex + 1, 0);
  }
  renderSyllabus();
}

// Start everything
window.onload = init;

// ==========================================
// Coding Lab - ns-3 LeetCode Component
// ==========================================

const codingLabProblems = [
  {
    id: "basic-nodes",
    title: "1. Hello World & Node Creation",
    difficulty: "Basic",
    difficultyClass: "difficulty-basic",
    summary: "Create nodes and print validation logs.",
    description: `<p><strong>Objective:</strong> Create a NodeContainer with 2 nodes and print a simple console log.</p>
                  <p>In ns-3, nodes are created using the [[NodeContainer]] helper class.</p>
                  <p>Use <code>nodes.Create (2);</code> to instantiate nodes, and then output <code>"Hello World from ns-3! Created 2 nodes."</code> using standard C++ <code>std::cout</code>.</p>
                  <p><strong>Note:</strong> Write the complete <code>int main (int argc, char *argv[])</code> block and structure yourself.</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer nodes;
  nodes.Create (2);

  std::cout << "Hello World from ns-3! Created " << nodes.GetN() << " nodes." << std::endl;
  return 0;
}
`,
    hints: [
      "Declare the main entrypoint: <code>int main (int argc, char *argv[])</code>.",
      "Instantiate a [[NodeContainer]] object: <code>NodeContainer nodes;</code>",
      "Create nodes using Create(): <code>nodes.Create (2);</code>",
      "Print output: <code>std::cout << \"Hello World from ns-3! Created \" << nodes.GetN() << \" nodes.\" << std::endl;</code>"
    ]
  },
  {
    id: "basic-args",
    title: "2. Dynamic Node Parameterization",
    difficulty: "Basic",
    difficultyClass: "difficulty-basic",
    summary: "Implement CommandLine parsing for dynamic node counts.",
    description: `<p><strong>Objective:</strong> Write a script that reads an integer parameter <code>nodeCount</code> from the command line (default value: 4), instantiates that number of nodes, and outputs the result.</p>
                  <p>Use the [[CommandLine]] helper to map a local variable, parse arguments, and print: <code>"Created X nodes dynamically."</code> (where X is the variable value).</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  uint32_t nodeCount = 4;

  CommandLine cmd (__FILE__);
  cmd.AddValue ("nodeCount", "Number of nodes to create", nodeCount);
  cmd.Parse (argc, argv);

  NodeContainer nodes;
  nodes.Create (nodeCount);

  std::cout << "Created " << nodes.GetN() << " nodes dynamically." << std::endl;
  return 0;
}
`,
    hints: [
      "Initialize your dynamic variable first: <code>uint32_t nodeCount = 4;</code>",
      "Instantiate [[CommandLine]]: <code>CommandLine cmd (__FILE__);</code>",
      "Bind variable to parser: <code>cmd.AddValue (\"nodeCount\", \"Description\", nodeCount);</code>",
      "Call parse: <code>cmd.Parse (argc, argv);</code>"
    ]
  },
  {
    id: "basic-p2p",
    title: "3. Wired Point-to-Point Link",
    difficulty: "Basic",
    difficultyClass: "difficulty-basic",
    summary: "Configure a 2-node point-to-point connection.",
    description: `<p><strong>Objective:</strong> Establish a Point-to-Point link between 2 nodes.</p>
                  <p>Configure the link characteristics with a data rate of <code>"10Mbps"</code> and a propagation delay of <code>"5ms"</code>.</p>
                  <p>Use the [[PointToPointHelper]] to configure attributes and install them on your [[NodeContainer]], and output: <code>"P2P Link configured successfully."</code>.</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer nodes;
  nodes.Create (2);

  PointToPointHelper p2p;
  p2p.SetDeviceAttribute ("DataRate", StringValue ("10Mbps"));
  p2p.SetChannelAttribute ("Delay", StringValue ("5ms"));

  NetDeviceContainer devices;
  devices = p2p.Install (nodes);

  std::cout << "P2P Link configured successfully." << std::endl;
  return 0;
}
`,
    hints: [
      "Declare [[NodeContainer]] and create 2 nodes: <code>nodes.Create (2);</code>.",
      "Initialize helper: [[PointToPointHelper]] p2p;",
      "Set rate: <code>p2p.SetDeviceAttribute (\"DataRate\", StringValue (\"10Mbps\"));</code>",
      "Set delay: <code>p2p.SetChannelAttribute (\"Delay\", StringValue (\"5ms\"));</code>",
      "Install on nodes to get [[NetDevice]] objects: <code>NetDeviceContainer devices = p2p.Install (nodes);</code>"
    ]
  },
  {
    id: "intermediate-csma",
    title: "4. CSMA Shared Bus Topology",
    difficulty: "Intermediate",
    difficultyClass: "difficulty-intermediate",
    summary: "Connect 4 nodes in an Ethernet-like bus topology.",
    description: `<p><strong>Objective:</strong> Connect 4 nodes in a shared bus topology using CSMA.</p>
                  <p>Configure the shared CSMA channel with a data rate of <code>"100Mbps"</code> and a propagation delay of <code>"6560ns"</code>.</p>
                  <p>Use the [[CsmaHelper]] to set channel attributes and install devices on the nodes.</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/csma-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/csma-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer nodes;
  nodes.Create (4);

  CsmaHelper csma;
  csma.SetChannelAttribute ("DataRate", StringValue ("100Mbps"));
  csma.SetChannelAttribute ("Delay", TimeValue (NanoSeconds (6560)));

  NetDeviceContainer devices;
  devices = csma.Install (nodes);

  std::cout << "CSMA shared bus topology configured successfully." << std::endl;
  return 0;
}
`,
    hints: [
      "Create a [[NodeContainer]] of 4 nodes: <code>nodes.Create (4);</code>",
      "Initialize the helper class: [[CsmaHelper]] csma;",
      "Set channel delay: <code>csma.SetChannelAttribute (\"Delay\", TimeValue (NanoSeconds (6560)));</code>",
      "Install CSMA net devices to get [[NetDevice]] objects: <code>NetDeviceContainer devices = csma.Install (nodes);</code>"
    ]
  },
  {
    id: "intermediate-ip",
    title: "5. Internet Stack & IPv4 Subnets",
    difficulty: "Intermediate",
    difficultyClass: "difficulty-intermediate",
    summary: "Install transport protocols and assign IP addresses.",
    description: `<p><strong>Objective:</strong> Configure a 2-node point-to-point link, install protocol stacks, and assign static IP addresses.</p>
                  <p>Install the internet protocol stack using [[InternetStackHelper]].</p>
                  <p>Configure IP addresses with a base address of <code>"192.168.1.0"</code> and a mask of <code>"255.255.255.0"</code> using [[Ipv4AddressHelper]].</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include "ns3/internet-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include "ns3/internet-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer nodes;
  nodes.Create (2);

  PointToPointHelper p2p;
  p2p.SetDeviceAttribute ("DataRate", StringValue ("10Mbps"));
  p2p.SetChannelAttribute ("Delay", StringValue ("5ms"));

  NetDeviceContainer devices = p2p.Install (nodes);

  InternetStackHelper stack;
  stack.Install (nodes);

  Ipv4AddressHelper address;
  address.SetBase ("192.168.1.0", "255.255.255.0");
  Ipv4InterfaceContainer interfaces = address.Assign (devices);

  std::cout << "Internet stack installed and IPs assigned successfully." << std::endl;
  return 0;
}
`,
    hints: [
      "Ensure you include the header <code>#include \"ns3/internet-module.h\"</code>.",
      "Install the network stack using [[InternetStackHelper]]: <code>InternetStackHelper stack; stack.Install (nodes);</code>",
      "Configure base IP using [[Ipv4AddressHelper]]: <code>Ipv4AddressHelper address; address.SetBase (\"192.168.1.0\", \"255.255.255.0\");</code>",
      "Assign address interfaces: <code>Ipv4InterfaceContainer interfaces = address.Assign (devices);</code>"
    ]
  },
  {
    id: "intermediate-echo",
    title: "6. UDP Echo Application Setup",
    difficulty: "Intermediate",
    difficultyClass: "difficulty-intermediate",
    summary: "Configure and schedule client/server applications.",
    description: `<p><strong>Objective:</strong> Setup a 2-node wired network, install UDP Echo Server on Node 1 (port 9) starting at 1.0s, and UDP Echo Client on Node 0 (targeting Node 1, port 9, packet size 1024, max packets 1) starting at 2.0s.</p>
                  <p>Schedule application timers and invoke simulation run hooks using [[InternetStackHelper]] and client/server models.</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include "ns3/internet-module.h"
#include "ns3/applications-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include "ns3/internet-module.h"
#include "ns3/applications-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer nodes;
  nodes.Create (2);

  PointToPointHelper p2p;
  p2p.SetDeviceAttribute ("DataRate", StringValue ("5Mbps"));
  p2p.SetChannelAttribute ("Delay", StringValue ("2ms"));

  NetDeviceContainer devices = p2p.Install (nodes);

  InternetStackHelper stack;
  stack.Install (nodes);

  Ipv4AddressHelper address;
  address.SetBase ("10.1.1.0", "255.255.255.0");
  Ipv4InterfaceContainer interfaces = address.Assign (devices);

  UdpEchoServerHelper echoServer (9);
  ApplicationContainer serverApps = echoServer.Install (nodes.Get (1));
  serverApps.Start (Seconds (1.0));
  serverApps.Stop (Seconds (10.0));

  UdpEchoClientHelper echoClient (interfaces.GetAddress (1), 9);
  echoClient.SetAttribute ("MaxPackets", UintegerValue (1));
  echoClient.SetAttribute ("Interval", TimeValue (Seconds (1.0)));
  echoClient.SetAttribute ("PacketSize", UintegerValue (1024));

  ApplicationContainer clientApps = echoClient.Install (nodes.Get (0));
  clientApps.Start (Seconds (2.0));
  clientApps.Stop (Seconds (10.0));

  Simulator::Run ();
  Simulator::Destroy ();

  std::cout << "UDP Echo Client and Server configured and scheduled." << std::endl;
  return 0;
}
`,
    hints: [
      "Include application headers: <code>#include \"ns3/applications-module.h\"</code>.",
      "Initialize UDP server on port 9: <code>[[UdpEchoServerHelper]] echoServer (9);</code> and install it on Node 1: <code>nodes.Get (1)</code>.",
      "Configure UDP client: <code>[[UdpEchoClientHelper]] echoClient (interfaces.GetAddress (1), 9);</code>",
      "Configure client parameters like packet count and size, then install on Node 0."
    ]
  },
  {
    id: "basic-mobility",
    title: "7. Constant Position Mobility",
    difficulty: "Basic",
    difficultyClass: "difficulty-basic",
    summary: "Assign physical 3D coordinates to nodes.",
    description: `<p><strong>Objective:</strong> Place 3 nodes in a 3D coordinate system using [[MobilityHelper]] at static positions.</p>
                  <p>Configure AP at position <code>(0.0, 0.0, 0.0)</code>, Station 1 at <code>(10.0, 0.0, 0.0)</code>, and Station 2 at <code>(20.0, 0.0, 0.0)</code>.</p>
                  <p>Use <code>ListPositionAllocator</code> and set the mobility model to <code>"ns3::ConstantPositionMobilityModel"</code>.</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/mobility-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/mobility-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer nodes;
  nodes.Create (3);

  MobilityHelper mobility;
  Ptr<ListPositionAllocator> positionAlloc = CreateObject<ListPositionAllocator> ();
  positionAlloc->Add (Vector (0.0, 0.0, 0.0));
  positionAlloc->Add (Vector (10.0, 0.0, 0.0));
  positionAlloc->Add (Vector (20.0, 0.0, 0.0));

  mobility.SetPositionAllocator (positionAlloc);
  mobility.SetMobilityModel ("ns3::ConstantPositionMobilityModel");
  mobility.Install (nodes);

  std::cout << "Mobility coordinates allocated successfully." << std::endl;
  return 0;
}
`,
    hints: [
      "Include the mobility header: <code>#include \"ns3/mobility-module.h\"</code>.",
      "Create the position allocator: <code>Ptr&lt;ListPositionAllocator&gt; positionAlloc = CreateObject&lt;ListPositionAllocator&gt; ();</code>",
      "Add positions sequentially using 3D Vectors: <code>positionAlloc-&gt;Add (Vector (x, y, z));</code>",
      "Set allocator and model on your [[MobilityHelper]] object before calling Install."
    ]
  },
  {
    id: "intermediate-multilink",
    title: "8. Linear Multi-Segment Network",
    difficulty: "Intermediate",
    difficultyClass: "difficulty-intermediate",
    summary: "Connect 3 nodes across two subnets with routing.",
    description: `<p><strong>Objective:</strong> Create a linear network topology of 3 nodes: Node 0 connects to Node 1, and Node 1 connects to Node 2.</p>
                  <p>Configure P2P Links A and B with DataRate <code>"5Mbps"</code> and Delay <code>"2ms"</code> using [[PointToPointHelper]].</p>
                  <p>Install internet stack using [[InternetStackHelper]] and assign subnets <code>"10.1.1.0/24"</code> (Link A) and <code>"10.1.2.0/24"</code> (Link B) using [[Ipv4AddressHelper]].</p>
                  <p>Enable static routing tables using global routing tables helper.</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include "ns3/internet-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include "ns3/internet-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer nodes;
  nodes.Create (3);

  NodeContainer linkANodes = NodeContainer (nodes.Get (0), nodes.Get (1));
  NodeContainer linkBNodes = NodeContainer (nodes.Get (1), nodes.Get (2));

  PointToPointHelper p2p;
  p2p.SetDeviceAttribute ("DataRate", StringValue ("5Mbps"));
  p2p.SetChannelAttribute ("Delay", StringValue ("2ms"));

  NetDeviceContainer devicesA = p2p.Install (linkANodes);
  NetDeviceContainer devicesB = p2p.Install (linkBNodes);

  InternetStackHelper stack;
  stack.Install (nodes);

  Ipv4AddressHelper address;
  address.SetBase ("10.1.1.0", "255.255.255.0");
  address.Assign (devicesA);

  address.SetBase ("10.1.2.0", "255.255.255.0");
  address.Assign (devicesB);

  Ipv4GlobalRoutingHelper::PopulateRoutingTables ();

  std::cout << "Linear multi-subnet routing configured successfully." << std::endl;
  return 0;
}
`,
    hints: [
      "Group nodes into separate links: <code>NodeContainer linkANodes = NodeContainer (nodes.Get(0), nodes.Get(1));</code>",
      "Declare [[PointToPointHelper]] and install it on both linkANodes and linkBNodes.",
      "Assign base addresses for each link separately using [[Ipv4AddressHelper]]: call <code>address.SetBase (...)</code> then <code>address.Assign (...)</code>.",
      "Enable global routing tables so remote packets can be routed: <code>Ipv4GlobalRoutingHelper::PopulateRoutingTables ();</code>"
    ]
  },
  {
    id: "intermediate-hybrid",
    title: "9. Hybrid Topology (CSMA + P2P)",
    difficulty: "Intermediate",
    difficultyClass: "difficulty-intermediate",
    summary: "Link a CSMA subnet to a remote node via P2P.",
    description: `<p><strong>Objective:</strong> Create a hybrid network. Node 0, Node 1, and Node 2 share a [[CsmaHelper]] bus (100Mbps, 6560ns).</p>
                  <p>Connect Node 2 to a remote Node 3 via a [[PointToPointHelper]] link (10Mbps, 5ms).</p>
                  <p>Assign IP subnets <code>"172.16.1.0/24"</code> (CSMA bus) and <code>"192.168.1.0/24"</code> (P2P Link) using [[Ipv4AddressHelper]].</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include "ns3/csma-module.h"
#include "ns3/internet-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include "ns3/csma-module.h"
#include "ns3/internet-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer csmaNodes;
  csmaNodes.Create (3); // Nodes 0, 1, 2

  NodeContainer p2pNodes;
  p2pNodes.Create (1); // Node 3
  p2pNodes.Add (csmaNodes.Get (2)); // Node 2 is the gateway

  CsmaHelper csma;
  csma.SetChannelAttribute ("DataRate", StringValue ("100Mbps"));
  csma.SetChannelAttribute ("Delay", TimeValue (NanoSeconds (6560)));
  NetDeviceContainer csmaDevices = csma.Install (csmaNodes);

  PointToPointHelper p2p;
  p2p.SetDeviceAttribute ("DataRate", StringValue ("10Mbps"));
  p2p.SetChannelAttribute ("Delay", StringValue ("5ms"));
  NetDeviceContainer p2pDevices = p2p.Install (p2pNodes);

  InternetStackHelper stack;
  stack.Install (csmaNodes);
  stack.Install (p2pNodes.Get (0)); // Node 3 stack (Node 2 stack is already installed)

  Ipv4AddressHelper address;
  address.SetBase ("172.16.1.0", "255.255.255.0");
  address.Assign (csmaDevices);

  address.SetBase ("192.168.1.0", "255.255.255.0");
  address.Assign (p2pDevices);

  Ipv4GlobalRoutingHelper::PopulateRoutingTables ();

  std::cout << "Hybrid CSMA-P2P network created successfully." << std::endl;
  return 0;
}
`,
    hints: [
      "Group Node 2 and Node 3 into a point-to-point node container: <code>p2pNodes.Add (csmaNodes.Get (2));</code>",
      "Configure [[CsmaHelper]] and install on csmaNodes, configure [[PointToPointHelper]] and install on p2pNodes.",
      "Assign base 172.16.1.0/24 to CSMA devices and base 192.168.1.0/24 to P2P devices using [[Ipv4AddressHelper]].",
      "Populate routing tables: <code>Ipv4GlobalRoutingHelper::PopulateRoutingTables ();</code>."
    ]
  },
  {
    id: "intermediate-error",
    title: "10. Rate Error Model Configuration",
    difficulty: "Intermediate",
    difficultyClass: "difficulty-intermediate",
    summary: "Configure channel packet loss using error models.",
    description: `<p><strong>Objective:</strong> Configure a 2-node point-to-point link and introduce packet drops using [[PointToPointHelper]].</p>
                  <p>Instantiate a [[RateErrorModel]]. Set its rate attribute to <code>0.05</code> (5% packet loss) on bytes basis.</p>
                  <p>Attach the error model to the receiving node's device (index 1 of your NetDeviceContainer) using the attribute <code>"ReceiveErrorModel"</code>.</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer nodes;
  nodes.Create (2);

  PointToPointHelper p2p;
  p2p.SetDeviceAttribute ("DataRate", StringValue ("10Mbps"));
  p2p.SetChannelAttribute ("Delay", StringValue ("5ms"));

  NetDeviceContainer devices = p2p.Install (nodes);

  Ptr<RateErrorModel> em = CreateObject<RateErrorModel> ();
  em->SetAttribute ("ErrorRate", DoubleValue (0.05));
  em->SetAttribute ("ErrorUnit", ObjectValue (Create<EnumValue> (RateErrorModel::ERROR_UNIT_BYTE)));
  
  devices.Get (1)->SetAttribute ("ReceiveErrorModel", ObjectValue (em));

  std::cout << "Rate error model attached to receiver NetDevice." << std::endl;
  return 0;
}
`,
    hints: [
      "Instantiate error model pointer: <code>Ptr&lt;RateErrorModel&gt; em = CreateObject&lt;RateErrorModel&gt; ();</code>",
      "Configure loss probability: <code>em-&gt;SetAttribute (\"ErrorRate\", DoubleValue (0.05));</code>",
      "Set error unit unit to bytes: <code>em-&gt;SetAttribute (\"ErrorUnit\", ObjectValue (Create&lt;EnumValue&gt; (RateErrorModel::ERROR_UNIT_BYTE)));</code>",
      "Apply to receiver device index 1: <code>devices.Get (1)-&gt;SetAttribute (\"ReceiveErrorModel\", ObjectValue (em));</code>"
    ]
  },
  {
    id: "intermediate-tracing",
    title: "11. Trace Source Callback Binding",
    difficulty: "Intermediate",
    difficultyClass: "difficulty-intermediate",
    summary: "Connect a custom callback to device trace sources.",
    description: `<p><strong>Objective:</strong> Create a point-to-point network between Node 0 and Node 1. Configure the link (10Mbps, 5ms).</p>
                  <p>Write a global callback function: <code>void TxCallback (Ptr&lt;const Packet&gt; packet)</code> that prints: <code>"Packet transmitted: X bytes."</code> (where X is <code>packet-&gt;GetSize ()</code>).</p>
                  <p>Retrieve Node 0's device (index 0 of the container) and connect this callback to its <code>"MacTx"</code> trace source using <code>TraceConnectWithoutContext</code>.</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include <iostream>

using namespace ns3;

// Define your callback function here

// Write your main code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include <iostream>

using namespace ns3;

void TxCallback (Ptr<const Packet> packet)
{
  std::cout << "Packet transmitted: " << packet->GetSize () << " bytes." << std::endl;
}

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer nodes;
  nodes.Create (2);

  PointToPointHelper p2p;
  p2p.SetDeviceAttribute ("DataRate", StringValue ("10Mbps"));
  p2p.SetChannelAttribute ("Delay", StringValue ("5ms"));

  NetDeviceContainer devices = p2p.Install (nodes);

  // Connect callback to the MacTx trace source
  devices.Get (0)->TraceConnectWithoutContext ("MacTx", MakeCallback (&TxCallback));

  std::cout << "Trace callback connected successfully." << std::endl;
  return 0;
}
`,
    hints: [
      "Define the callback signature: <code>void TxCallback (Ptr&lt;const Packet&gt; packet)</code>.",
      "Retrieve the device using index 0: <code>Ptr&lt;NetDevice&gt; dev = devices.Get (0);</code>.",
      "Connect the callback using TraceConnectWithoutContext: <code>dev-&gt;TraceConnectWithoutContext (\"MacTx\", MakeCallback (&TxCallback));</code>.",
      "Remember to include <code>#include \"ns3/point-to-point-module.h\"</code> and <code>#include \"ns3/network-module.h\"</code>."
    ]
  },
  {
    id: "intermediate-onoff-sink",
    title: "12. Bulk Traffic with OnOff & PacketSink",
    difficulty: "Intermediate",
    difficultyClass: "difficulty-intermediate",
    summary: "Generate continuous traffic stream using OnOff source.",
    description: `<p><strong>Objective:</strong> Connect 3 nodes in a CSMA bus topology (100Mbps, 6560ns) using [[CsmaHelper]]. Install the internet stack and assign subnet <code>10.1.1.0/24</code>.</p>
                  <p>Install a [[PacketSinkHelper]] application on Node 2 listening on UDP port 80.</p>
                  <p>Install a [[OnOffHelper]] application on Node 0 pointing to Node 2's IP address. Set its DataRate to <code>500Kbps</code>, PacketSize to <code>512</code> bytes, and transport protocol to UDP.</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/csma-module.h"
#include "ns3/internet-module.h"
#include "ns3/applications-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/csma-module.h"
#include "ns3/internet-module.h"
#include "ns3/applications-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer nodes;
  nodes.Create (3);

  CsmaHelper csma;
  csma.SetChannelAttribute ("DataRate", StringValue ("100Mbps"));
  csma.SetChannelAttribute ("Delay", TimeValue (NanoSeconds (6560)));

  NetDeviceContainer devices = csma.Install (nodes);

  InternetStackHelper stack;
  stack.Install (nodes);

  Ipv4AddressHelper address;
  address.SetBase ("10.1.1.0", "255.255.255.0");
  Ipv4InterfaceContainer interfaces = address.Assign (devices);

  Address sinkAddress (InetSocketAddress (interfaces.GetAddress (2), 80));
  PacketSinkHelper packetSinkHelper ("ns3::UdpSocketFactory", sinkAddress);
  ApplicationContainer sinkApps = packetSinkHelper.Install (nodes.Get (2));
  sinkApps.Start (Seconds (1.0));

  OnOffHelper onoffHelper ("ns3::UdpSocketFactory", sinkAddress);
  onoffHelper.SetAttribute ("DataRate", StringValue ("500Kbps"));
  onoffHelper.SetAttribute ("PacketSize", UintegerValue (512));
  ApplicationContainer clientApps = onoffHelper.Install (nodes.Get (0));
  clientApps.Start (Seconds (2.0));

  std::cout << "OnOff bulk traffic generation configured successfully." << std::endl;
  return 0;
}
`,
    hints: [
      "Create a sink address for Node 2 on port 80: <code>Address sinkAddress (InetSocketAddress (interfaces.GetAddress (2), 80));</code>.",
      "Use [[PacketSinkHelper]] to configure Node 2: <code>PacketSinkHelper packetSinkHelper (\"ns3::UdpSocketFactory\", sinkAddress);</code>.",
      "Configure [[OnOffHelper]]: <code>OnOffHelper onoffHelper (\"ns3::UdpSocketFactory\", sinkAddress);</code>.",
      "Set attributes for DataRate and PacketSize on the [[OnOffHelper]]: <code>onoffHelper.SetAttribute (\"DataRate\", StringValue (\"500Kbps\"));</code>."
    ]
  },
  {
    id: "advanced-qos-edca",
    title: "13. QoS EDCA Queue Customization",
    difficulty: "Advanced",
    difficultyClass: "difficulty-advanced",
    summary: "Customize Wi-Fi QoS EDCA channel access parameters.",
    description: `<p><strong>Objective:</strong> Configure a wireless network using QoS-enabled WiFi MAC settings.</p>
                  <p>Initialize a [[WifiHelper]] and set the standard to <code>WIFI_STANDARD_80211n</code>.</p>
                  <p>Use [[WifiMacHelper]] to configure stations in Adhoc mode (<code>"ns3::AdhocWifiMac"</code>).</p>
                  <p>Access the Voice Queue channel access parameters (<code>VoTxop</code>) and set its <code>Aifsn</code> parameter to <code>2</code> using the <code>Config::Set</code> path.</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/wifi-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/wifi-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer nodes;
  nodes.Create (2);

  WifiHelper wifi;
  wifi.SetStandard (WIFI_STANDARD_80211n);
  wifi.SetRemoteStationManager ("ns3::ConstantRateWifiManager");

  YansWifiChannelHelper channel = YansWifiChannelHelper::Default ();
  YansWifiPhyHelper phy;
  phy.SetChannel (channel.Create ());

  WifiMacHelper mac;
  mac.SetType ("ns3::AdhocWifiMac");

  NetDeviceContainer devices = wifi.Install (phy, mac, nodes);

  // Set Voice queue AIFSN to 2 using Config path
  Config::Set ("/NodeList/*/DeviceList/*/$ns3::WifiNetDevice/Mac/VoTxop/Aifsn", UintegerValue (2));

  std::cout << "QoS EDCA parameters configured successfully." << std::endl;
  return 0;
}
`,
    hints: [
      "Set the standard to 802.11n: <code>wifi.SetStandard (WIFI_STANDARD_80211n);</code> using [[WifiHelper]].",
      "Install devices using [[WifiMacHelper]] and [[WifiHelper]].",
      "Access the Voice queue (VoTxop) parameters of the [[WifiNetDevice]] using: <code>Config::Set (\"/NodeList/*/DeviceList/*/$ns3::WifiNetDevice/Mac/VoTxop/Aifsn\", UintegerValue (2));</code>.",
      "Verify you use <code>UintegerValue</code> to set the AIFSN parameter."
    ]
  },
  {
    id: "advanced-wifi7-mlo-channels",
    title: "14. WiFi 7 MLO Multi-Band Channel Configuration",
    difficulty: "Advanced",
    difficultyClass: "difficulty-advanced",
    summary: "Configure separate frequency bands for Multi-Link Operation.",
    description: `<p><strong>Objective:</strong> Setup a Multi-Link AP and STA node supporting WiFi 7 (<code>WIFI_STANDARD_80211be</code>).</p>
                  <p>Initialize a [[SpectrumWifiPhyHelper]] with <code>2</code> link interfaces.</p>
                  <p>Configure Link 0 to operate on the 5 GHz band (channel width 80 MHz, control channel 36) using settings string: <code>"{0, 80, BAND_5GHZ, 0}"</code>.</p>
                  <p>Configure Link 1 to operate on the 6 GHz band (channel width 160 MHz, control channel 37) using settings string: <code>"{1, 160, BAND_6GHZ, 0}"</code>.</p>
                  <p>Set the MAC layer type to AP on one container and STA on the other, using default [[MLO]] configurations.</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/wifi-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/wifi-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer apNode;
  apNode.Create (1);

  NodeContainer staNode;
  staNode.Create (1);

  WifiHelper wifi;
  wifi.SetStandard (WIFI_STANDARD_80211be);

  SpectrumWifiPhyHelper phy (2);
  phy.Set (0, "ChannelSettings", StringValue ("{0, 80, BAND_5GHZ, 0}"));
  phy.Set (1, "ChannelSettings", StringValue ("{1, 160, BAND_6GHZ, 0}"));

  WifiMacHelper mac;
  mac.SetMultiLinkType (WifiHelper::DEFAULT_MLD);

  Ssid ssid = Ssid ("mlo-network");
  mac.SetType ("ns3::ApWifiMac", "Ssid", SsidValue (ssid));
  NetDeviceContainer apDevice = wifi.Install (phy, mac, apNode);

  mac.SetType ("ns3::StaWifiMac", "Ssid", SsidValue (ssid));
  NetDeviceContainer staDevice = wifi.Install (phy, mac, staNode);

  std::cout << "WiFi 7 MLO channels configured successfully." << std::endl;
  return 0;
}
`,
    hints: [
      "Instantiate the [[SpectrumWifiPhyHelper]] for 2 links: <code>SpectrumWifiPhyHelper phy (2);</code>.",
      "Set the settings for Link 0: <code>phy.Set (0, \"ChannelSettings\", StringValue (\"{0, 80, BAND_5GHZ, 0}\"));</code>.",
      "Set the settings for Link 1: <code>phy.Set (1, \"ChannelSettings\", StringValue (\"{1, 160, BAND_6GHZ, 0}\"));</code>.",
      "Enable [[MLO]] support on the MAC helper: <code>mac.SetMultiLinkType (WifiHelper::DEFAULT_MLD);</code>."
    ]
  },
  {
    id: "pro-wifi8-cosr-sensitivity",
    title: "15. WiFi 8 Coordinated Spatial Reuse Sensitivity",
    difficulty: "Pro",
    difficultyClass: "difficulty-pro",
    summary: "Tweak physical layer CCA thresholds for Coordinated Spatial Reuse.",
    description: `<p><strong>Objective:</strong> Set up a basic point-to-point wireless configuration. To test candidate WiFi 8 Coordinated Spatial Reuse ([[COSR]]) mechanics, adjust CCA sensitivity thresholds.</p>
                  <p>Set the standard to <code>WIFI_STANDARD_80211be</code> (used to build WiFi 8 research models).</p>
                  <p>Modify the default <code>CcaSensitivityThreshold</code> of [[WifiPhy]] to <code>-72.0</code> dBm globally using <code>Config::SetDefault</code>, which allows devices to ignore weaker overlapping cell interference and transmit concurrently.</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/wifi-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/wifi-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  // Set CCA sensitivity threshold attribute globally
  Config::SetDefault ("ns3::WifiPhy::CcaSensitivityThreshold", DoubleValue (-72.0));

  NodeContainer nodes;
  nodes.Create (2);

  WifiHelper wifi;
  wifi.SetStandard (WIFI_STANDARD_80211be);

  YansWifiChannelHelper channel = YansWifiChannelHelper::Default ();
  YansWifiPhyHelper phy;
  phy.SetChannel (channel.Create ());

  WifiMacHelper mac;
  mac.SetType ("ns3::AdhocWifiMac");

  NetDeviceContainer devices = wifi.Install (phy, mac, nodes);

  std::cout << "COSR CCA threshold configured globally." << std::endl;
  return 0;
}
`,
    hints: [
      "Set the CCA sensitivity default globally: <code>Config::SetDefault (\"ns3::WifiPhy::CcaSensitivityThreshold\", DoubleValue (-72.0));</code>.",
      "Verify that you use <code>DoubleValue</code> for threshold configuration.",
      "Setup a basic 802.11be Adhoc wireless network using [[WifiHelper]] and [[WifiMacHelper]] to install the devices and apply the settings.",
      "Ensure you output the required success trace console log."
    ]
  }
];

let selectedProblemIndex = 0;
let currentRevealedHintIndex = -1;
let problemSubmissions = JSON.parse(localStorage.getItem('tesla_netsim_coding_submissions')) || {};

function initCodingLab() {
  renderProblemList();
  selectProblem(0);
}

function renderProblemList() {
  const container = document.getElementById('problem-list');
  if (!container) return;
  container.innerHTML = '';

  codingLabProblems.forEach((prob, index) => {
    const item = document.createElement('div');
    item.className = `problem-item ${index === selectedProblemIndex ? 'active' : ''} ${problemSubmissions[prob.id] ? 'completed' : ''}`;
    item.onclick = () => selectProblem(index);

    item.innerHTML = `
      <div class="problem-item-header">
        <span class="problem-title">${prob.title}</span>
        <span class="problem-difficulty ${prob.difficultyClass}">${prob.difficulty}</span>
      </div>
      <span class="problem-summary">${prob.summary}</span>
    `;
    container.appendChild(item);
  });
}

function selectProblem(index) {
  selectedProblemIndex = index;
  const prob = codingLabProblems[index];
  
  // Highlight in sidebar
  document.querySelectorAll('.problem-item').forEach((item, idx) => {
    if (idx === index) item.classList.add('active');
    else item.classList.remove('active');
  });

  // Load details
  const diffBadge = document.getElementById('problem-difficulty');
  if (diffBadge) {
    diffBadge.innerText = prob.difficulty;
    diffBadge.className = `difficulty-badge ${prob.difficultyClass}`;
  }
  
  const titleEditor = document.getElementById('problem-title-editor');
  if (titleEditor) titleEditor.innerText = prob.title;

  const descContent = document.getElementById('problem-description');
  if (descContent) descContent.innerHTML = parseWikiLinks(prob.description);

  // Load editor code (use saved submission if exists, otherwise template)
  const savedCode = problemSubmissions[prob.id] || prob.template;
  const editor = document.getElementById('code-editor');
  if (editor) editor.value = savedCode;

  // Reset console output panel
  clearConsole();

  const statusText = document.getElementById('editor-status-text');
  if (statusText) statusText.innerText = 'Ready';

  // Reset Hints Panel
  currentRevealedHintIndex = -1;
  const hintBox = document.getElementById('revealed-hint-box');
  if (hintBox) {
    hintBox.style.display = 'none';
    hintBox.innerHTML = '';
  }
  const hintBtn = document.getElementById('btn-reveal-hint');
  if (hintBtn) {
    hintBtn.style.display = 'inline-block';
    hintBtn.innerText = 'Reveal Hint';
  }

  syncLineNumbers();
}

function resetToTemplate() {
  const prob = codingLabProblems[selectedProblemIndex];
  const editor = document.getElementById('code-editor');
  if (editor) {
    editor.value = prob.template;
    syncLineNumbers();
  }
  const statusText = document.getElementById('editor-status-text');
  if (statusText) statusText.innerText = 'Reset to Template';
}

function syncLineNumbers() {
  const editor = document.getElementById('code-editor');
  const lineNumContainer = document.getElementById('line-numbers');
  if (!editor || !lineNumContainer) return;

  const lines = editor.value.split('\n');
  const count = lines.length || 1;
  let html = '';
  for (let i = 1; i <= count; i++) {
    html += i + '<br>';
  }
  lineNumContainer.innerHTML = html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function revealNextHint() {
  const prob = codingLabProblems[selectedProblemIndex];
  if (!prob.hints || prob.hints.length === 0) return;

  const hintBox = document.getElementById('revealed-hint-box');
  if (!hintBox) return;

  currentRevealedHintIndex++;
  
  if (currentRevealedHintIndex === 0) {
    hintBox.style.display = 'block';
    hintBox.innerHTML = '<h4>💡 Hints:</h4><ol id="hints-list" style="padding-left:18px; margin-top:8px;"></ol>';
  }

  const list = document.getElementById('hints-list');
  if (list && currentRevealedHintIndex < prob.hints.length) {
    const li = document.createElement('li');
    li.innerHTML = parseWikiLinks(prob.hints[currentRevealedHintIndex]);
    li.style.marginBottom = '6px';
    list.appendChild(li);
  }

  // Show locked solution button once all standard hints are revealed
  if (currentRevealedHintIndex >= prob.hints.length - 1) {
    const btn = document.getElementById('btn-reveal-hint');
    if (btn) btn.style.display = 'none';

    // Append Reveal Solution button
    const revealSolBtn = document.createElement('button');
    revealSolBtn.id = 'btn-reveal-sol';
    revealSolBtn.className = 'btn btn-primary btn-sm mt-3';
    revealSolBtn.style.width = '100%';
    revealSolBtn.innerHTML = '🔓 Reveal Full Solution';
    revealSolBtn.onclick = revealSolution;
    hintBox.appendChild(revealSolBtn);
  }
}

window.revealSolution = function() {
  const prob = codingLabProblems[selectedProblemIndex];
  const hintBox = document.getElementById('revealed-hint-box');
  if (!prob || !hintBox) return;

  const solDiv = document.createElement('div');
  solDiv.style.marginTop = '16px';
  solDiv.innerHTML = `
    <h4 style="margin-top:14px; color:#fbbf24; font-weight:600;">🔑 Complete C++ Solution:</h4>
    <pre style="background:#05070c; padding:12px; border-radius:6px; border:1px solid var(--border-glow); margin-top:8px; overflow-x:auto;"><code style="font-family:monospace; color:#34d399; font-size:12.5px; white-space:pre;">${escapeHtml(prob.solution)}</code></pre>
  `;
  hintBox.appendChild(solDiv);

  // Hide the reveal solution button
  const btn = document.getElementById('btn-reveal-sol');
  if (btn) btn.style.display = 'none';
};

function clearConsole() {
  const consoleBody = document.getElementById('console-body');
  if (consoleBody) consoleBody.innerHTML = '';
  const consoleWrapper = document.getElementById('terminal-console-wrapper');
  if (consoleWrapper) consoleWrapper.style.display = 'none';
}

function submitCode() {
  const editor = document.getElementById('code-editor');
  const prob = codingLabProblems[selectedProblemIndex];
  if (!editor || !prob) return;
  const code = editor.value;

  const statusText = document.getElementById('editor-status-text');
  if (statusText) statusText.innerText = 'Compiling...';

  // Toggle terminal visibility and output info
  const consoleWrapper = document.getElementById('terminal-console-wrapper');
  const consoleBody = document.getElementById('console-body');
  if (consoleWrapper) consoleWrapper.style.display = 'flex';
  if (consoleBody) {
    consoleBody.className = 'console-body info';
    consoleBody.innerHTML = `[System] Saving code to scratch/aerowlan_exercises/submissions/${prob.id}.cc...\n[System] Compiling targets via CMake...\n[System] Please wait, this may take up to 25 seconds...`;
  }

  fetch('/api/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      problem_id: prob.id,
      code: code
    })
  })
  .then(res => res.json())
  .then(data => {
    if (!consoleBody) return;
    
    if (data.status === 'success') {
      if (statusText) statusText.innerText = 'Passed';
      consoleBody.className = 'console-body';
      consoleBody.innerHTML = `[Compilation Success]\n[Running Simulation...]\n\n${data.output}\n\n[Status] SUCCESS: Exercise completed successfully!`;
      
      // Save progress
      problemSubmissions[prob.id] = code;
      localStorage.setItem('tesla_netsim_coding_submissions', JSON.stringify(problemSubmissions));
      renderProblemList();
    } else if (data.status === 'compile_error') {
      if (statusText) statusText.innerText = 'Compile Error';
      consoleBody.className = 'console-body error';
      consoleBody.innerHTML = `[Compilation Failed]\n\n${data.output}`;
    } else if (data.status === 'runtime_error') {
      if (statusText) statusText.innerText = 'Runtime Error';
      consoleBody.className = 'console-body error';
      consoleBody.innerHTML = `[Simulation Crash / Runtime Error]\n\n${data.output}`;
    } else {
      if (statusText) statusText.innerText = 'Error';
      consoleBody.className = 'console-body error';
      consoleBody.innerHTML = `[Error] ${data.message}`;
    }
    consoleBody.scrollTop = consoleBody.scrollHeight;
  })
  .catch(err => {
    console.error(err);
    if (statusText) statusText.innerText = 'Connection Error';
    if (consoleBody) {
      consoleBody.className = 'console-body error';
      consoleBody.innerHTML = `[Connection Error] Could not reach local server. Make sure you started the backend by running ./run-dashboard.sh in your terminal!`;
    }
  });
}

// Global scope filters for Command Cheat Sheet
window.filterCheatCommands = function(category) {
  // Highlight tab
  document.querySelectorAll('.cheat-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-category') === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Filter cards
  document.querySelectorAll('.cheat-card').forEach(card => {
    if (category === 'all' || card.getAttribute('data-category') === category) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
};
