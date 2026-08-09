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
        description: "Core architectures, compilation flags, memory tracking, and C++ script layouts.",
        lessons: [
          {
            id: "T1-M1-L1",
            title: "1.1 ns-3 Architecture & Memory Management",
            moduleTitle: "Track 1 • Module 1 • Lesson 1",
            body: `
              <p>Welcome to ns-3! The <strong>ns-3 simulator</strong> is a discrete-event network simulator written in C++ and optimized for academic and industrial research.</p>
              <h4>1.1 Directory Structure & Core Modules</h4>
              <p>When you look inside the root directory <code>/home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45</code>, you will find:</p>
              <ul>
                <li><code>src/</code>: Contains the source code for all core simulator modules. Each folder inside (like <code>core</code>, <code>network</code>, <code>internet</code>, <code>wifi</code>) is compiled as a separate shared library.</li>
                <li><code>examples/</code>: Contains standard pre-written simulations demonstrating various protocols.</li>
                <li><code>scratch/</code>: The user playground. Any C++ script placed here with a <code>main()</code> function is dynamically compiled as an executable target by the build system.</li>
              </ul>
              <h4>1.2 Memory Management & smart pointers ([[NodeContainer]])</h4>
              <p>C++ is notorious for memory leaks. To prevent leaks, ns-3 employs a custom reference-counting system. Rather than raw pointers, objects are managed using the smart pointer template <code>Ptr&lt;T&gt;</code>.</p>
              <p>When you create a node in ns-3, you do not write <code>Node* node = new Node()</code>. Instead, you write:</p>
              <pre><code>Ptr<Node> node = CreateObject<Node> ();</code></pre>
              <p>The class [[NodeContainer]] is a helper that wraps an array of <code>Ptr&lt;Node&gt;</code> pointers, making it easy to create and manage multiple hosts simultaneously.</p>
            `
          },
          {
            id: "T1-M1-L2",
            title: "1.2 Build Systems & Compilation Configuration",
            moduleTitle: "Track 1 • Module 1 • Lesson 2",
            body: `
              <p>ns-3 uses **CMake** to configure and build. To compile targets, we use the custom python orchestration script <code>./ns3</code> in the root directory.</p>
              <h4>1.2.1 Configuration Profiles</h4>
              <p>Before compiling, you must configure the project. There are two primary profiles:</p>
              <ol>
                <li><strong>Debug Profile</strong>: Configured using <code>--build-profile=debug</code>. It enables debugging symbols and, crucially, **runtime assertions** (tests that crash the simulator early if configuration parameters are illegal).</li>
                <li><strong>Optimized Profile</strong>: Configured using <code>--build-profile=optimized</code>. It strips debug info and enables compiler optimization flags (<code>-O3</code>). Crucial for running massive simulation sweeps which execute 5x to 10x faster.</li>
              </ol>
              <p>Example configuration command:</p>
              <pre><code>./ns3 configure --enable-examples --enable-tests --build-profile=debug</code></pre>
              <h4>1.2.2 Building the Project</h4>
              <p>Once configured, compile the targets using:</p>
              <pre><code>./ns3 build</code></pre>
              <p>Incremental compilation means if you modify a file in <code>scratch/</code>, only your script is compiled, taking ~2 seconds. However, if you modify a core header in <code>src/wifi/</code>, CMake must recompile the entire `wifi` module and all dependent modules, which can take several minutes.</p>
            `
          },
          {
            id: "T1-M1-L3",
            title: "1.3 Anatomy of an Event-Driven Simulation Script",
            moduleTitle: "Track 1 • Module 1 • Lesson 3",
            body: `
              <p>ns-3 is a <strong>discrete-event simulator</strong>. The virtual simulation clock only advances when an event is executed. Events are scheduled to run at specific timestamps in a chronological queue.</p>
              <h4>1.3.1 Core Script Boilerplate</h4>
              <p>Every ns-3 simulation follows a standard layout:</p>
              <ol>
                <li><strong>Headers</strong>: Include the module headers (e.g. <code>#include "ns3/core-module.h"</code>).</li>
                <li><strong>CommandLine Parsing</strong>: Enables passing arguments at runtime without recompiling.
                  <pre><code>CommandLine cmd (__FILE__);\ncmd.Parse (argc, argv);</code></pre>
                </li>
                <li><strong>Timeline Management</strong>: Set time resolution.
                  <pre><code>Time::SetResolution (Time::NS);</code></pre>
                </li>
                <li><strong>Node & Link Setup</strong>: Instantiate containers, helpers, and install channels.</li>
                <li><strong>Simulation Run</strong>: Advance the clock and execute events.
                  <pre><code>Simulator::Run ();\nSimulator::Destroy ();</code></pre>
                  <p>The call to <code>Simulator::Destroy()</code> is critical; it releases all reference-counted objects and prevents memory leaks.</p>
                </li>
              </ol>
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
              <ol>
                <li>Create a new C++ source file in your scratch directory: <code>scratch/aerowlan_exercises/module1_assignment.cc</code></li>
                <li>Write a standard ns-3 program that:
                  <ul>
                    <li>Includes <code>"ns3/core-module.h"</code> and <code>"ns3/network-module.h"</code>.</li>
                    <li>Declares a logging component name: <code>NS_LOG_COMPONENT_DEFINE ("AeroWlanModule1");</code></li>
                    <li>Initializes a variable: <code>uint32_t nodeCount = 3;</code></li>
                    <li>Uses the <code>CommandLine</code> helper to add a value parameter named <code>"nodeCount"</code> to override that variable at runtime.</li>
                    <li>Parses the command-line arguments.</li>
                    <li>Instantiates a [[NodeContainer]] and creates the specified <code>nodeCount</code> nodes.</li>
                    <li>Prints exactly: <code>Successfully created X nodes.</code> to the standard console output (where X is the number of nodes).</li>
                    <li>Safely runs and calls <code>Simulator::Destroy();</code> before exiting.</li>
                  </ul>
                </li>
              </ol>
              
              <h4>Step 1: Build the assignment target</h4>
              <p>Verify that your C++ file compiles correctly in your terminal:</p>
              <pre><code>./ns3 build</code></pre>
              
              <h4>Step 2: Run the simulation with custom arguments</h4>
              <p>Execute the program and pass <code>--nodeCount=6</code> to verify command line parsing works. Redirect the output to <code>module1_output.txt</code>:</p>
              <pre><code>./ns3 run "scratch/aerowlan_exercises/module1_assignment --nodeCount=6" > scratch/aerowlan_exercises/module1_output.txt 2>&1</code></pre>
              
              <h4>Step 3: Submit logs for verification</h4>
              <p>Open <code>scratch/aerowlan_exercises/module1_output.txt</code>, copy its content, and paste it into the submission paste area below to submit.</p>
            `,
            assignmentVerifyKeyword: "Successfully created 6 nodes.",
            practiceFile: "scratch/aerowlan_exercises/module1_assignment.cc"
          }
        ]
      },
      {
        id: 5,
        title: "Module 5: Conceptual Overview",
        description: "Key abstractions, nodes, devices, channels, and walkthrough of first.cc.",
        lessons: [
          {
            id: "T1-M5-L1",
            title: "5.1 Key Abstractions & 5.2.1-5.2.3 first.cc Anatomy",
            moduleTitle: "Track 1 • Module 5 • Lesson 1",
            body: `
              <p>Let's study the core architecture abstractions in detail:</p>
              <ul>
                <li><strong>Node:</strong> Models the computer or host. You add network device interfaces, protocols, and apps to it.</li>
                <li><strong>NetDevice:</strong> Models the interface card (NIC). Installed in a Node to attach it to a Channel.</li>
                <li><strong>Channel:</strong> Models the physical link (e.g. wired point-to-point connection or wireless channel).</li>
              </ul>
              <h4>Anatomy of first.cc includes:</h4>
              <p>The code starts with includes like <code>#include "ns3/core-module.h"</code> which wrap all headers in core, and uses namespace <code>ns3</code> to avoid name collisions.</p>
            `
          },
          {
            id: "T1-M5-L2",
            title: "5.2.4-5.2.9 Setting Up point-to-point links & Echo Applications",
            moduleTitle: "Track 1 • Module 5 • Lesson 2",
            body: `
              <p>Let's trace how <code>first.cc</code> creates a topology:</p>
              <pre><code>NodeContainer nodes;
nodes.Create (2); // Create Node 0 and Node 1

PointToPointHelper pointToPoint;
pointToPoint.SetDeviceAttribute ("DataRate", StringValue ("5Mbps"));
pointToPoint.SetChannelAttribute ("Delay", StringValue ("2ms"));

NetDeviceContainer devices;
devices = pointToPoint.Install (nodes);</code></pre>
              <p>The helper configures and creates the netdevices and channel, linking both nodes.</p>
              <h4>Internet Stack & Apps:</h4>
              <p>We install the IP stack and assign IP addresses:</p>
              <pre><code>InternetStackHelper stack;
stack.Install (nodes);

Ipv4AddressHelper address;
address.SetBase ("10.1.1.0", "255.255.255.0");
Ipv4InterfaceContainer interfaces = address.Assign (devices);</code></pre>
              <p>We deploy <code>UdpEchoServer</code> on Node 1 (port 9) and <code>UdpEchoClient</code> on Node 0 (targeting Node 1's IP address).</p>
            `
          },
          {
            id: "T1-M5-L3",
            title: "5.3 ns-3 Source Code structure",
            moduleTitle: "Track 1 • Module 5 • Lesson 3",
            body: `
              <p>Understanding the source directory structure helps when subclassing or modifying modules:</p>
              <ul>
                <li><code>src/</code>: Contains source code for all modules (e.g. <code>src/core/</code>, <code>src/network/</code>, <code>src/wifi/</code>).</li>
                <li><code>src/&lt;module&gt;/model/</code>: Holds the core C++ logic classes.</li>
                <li><code>src/&lt;module&gt;/helper/</code>: Holds convenience helper classes.</li>
                <li><code>src/&lt;module&gt;/test/</code>: Holds unit test scripts.</li>
              </ul>
            `
          },
          {
            id: "T1-M5-Q",
            title: "Module 5 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 1 • Module 5 • Assessment",
            quiz: [
              {
                question: "1. In first.cc, how many Nodes are created in the NodeContainer?",
                options: [
                  { text: "1 Node", isCorrect: false },
                  { text: "2 Nodes", isCorrect: true },
                  { text: "4 Nodes", isCorrect: false }
                ],
                feedbackSuccess: "Correct! The container instantiates 2 nodes (0 and 1) for the point-to-point link.",
                feedbackError: "Incorrect. first.cc configures a single link between 2 nodes. Try again!"
              },
              {
                question: "2. Which helper connects nodes via a point-to-point link?",
                options: [
                  { text: "CsmaHelper", isCorrect: false },
                  { text: "PointToPointHelper", isCorrect: true },
                  { text: "WifiHelper", isCorrect: false }
                ],
                feedbackSuccess: "Correct! PointToPointHelper builds point-to-point topologies.",
                feedbackError: "Incorrect. PointToPointHelper is used for link connections. Try again!"
              },
              {
                question: "3. What namespace contains all ns-3 classes?",
                options: [
                  { text: "std", isCorrect: false },
                  { text: "ns3", isCorrect: true },
                  { text: "net", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Everything resides in the 'ns3' namespace.",
                feedbackError: "Incorrect. The project uses the 'ns3' C++ namespace. Try again!"
              },
              {
                question: "4. What class manages Node IP configurations and base subnets?",
                options: [
                  { text: "Ipv4AddressHelper", isCorrect: true },
                  { text: "InternetStackHelper", isCorrect: false },
                  { text: "Ipv4InterfaceContainer", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Ipv4AddressHelper sets up subnets and assigns IPs.",
                feedbackError: "Incorrect. Ipv4AddressHelper assigns subnets to NetDeviceContainers. Try again!"
              },
              {
                question: "5. In the ns-3 source tree, where is core class logic placed?",
                options: [
                  { text: "src/<module>/helper/", isCorrect: false },
                  { text: "src/<module>/model/", isCorrect: true },
                  { text: "src/<module>/bindings/", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Core class headers and source files are in the model/ subfolder.",
                feedbackError: "Incorrect. Core logic is under src/<module>/model/. Try again!"
              }
            ]
          },
          {
            id: "T1-M5-A",
            title: "Module 5 Programming Assignment",
            isAssignmentOnly: true,
            moduleTitle: "Track 1 • Module 5 • Assignment",
            assignmentInstructions: `
              <h4>Assignment Objective:</h4>
              <p>Compile and run the Point-to-Point simulation to verify that the client connects to the server and exchanges packets.</p>
              
              <h4>Step 1: Open Terminal</h4>
              <p>Navigate to your ns-3 root directory: <code>/home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45</code></p>
              
              <h4>Step 2: Build the project</h4>
              <pre><code>./ns3 build</code></pre>
              
              <h4>Step 3: Run the simulation and save output</h4>
              <p>Run the script and redirect console stdout to <code>module5_output.txt</code>:</p>
              <pre><code>./ns3 run scratch/aerowlan_exercises/p2p-simulation > scratch/aerowlan_exercises/module5_output.txt 2>&1</code></pre>
              
              <h4>Step 4: Submit output</h4>
              <p>Copy all contents of <code>module5_output.txt</code> and paste it in the box below to verify.</p>
            `,
            assignmentVerifyKeyword: "TeslaP2PSimulation",
            practiceFile: "scratch/aerowlan_exercises/p2p-simulation.cc"
          }
        ]
      },
      {
        id: 6,
        title: "Module 6: Tweaking",
        description: "Enabling console log modules, command-line parsing, and custom inputs.",
        lessons: [
          {
            id: "T1-M6-L1",
            title: "6.1 Using the Logging Module",
            moduleTitle: "Track 1 • Module 6 • Lesson 1",
            body: `
              <p>ns-3 provides a robust logging subsystem that can be toggled without recompiling. Logging levels specify the detail of printed messages:</p>
              <ul>
                <li><code>LOG_LEVEL_ERROR</code>: Only print error logs.</li>
                <li><code>LOG_LEVEL_WARN</code>: Print warnings and errors.</li>
                <li><code>LOG_LEVEL_INFO</code>: Print informational logs (e.g. packet transmissions).</li>
                <li><code>LOG_LEVEL_ALL</code>: Print all logging details, including logical paths.</li>
              </ul>
              <p>Configure this via shell variables before running: <code>export NS_LOG="UdpEchoClientApplication=level_all"</code>.</p>
            `
          },
          {
            id: "T1-M6-L2",
            title: "6.2 Using Command Line Arguments",
            moduleTitle: "Track 1 • Module 6 • Lesson 2",
            body: `
              <p>You can configure variables dynamically during run time using the <code>CommandLine</code> class:</p>
              <pre><code>int main (int argc, char *argv[])
{
  uint32_t nPackets = 3;
  CommandLine cmd (__FILE__);
  cmd.AddValue ("nPackets", "Number of packets", nPackets);
  cmd.Parse (argc, argv);
  ...
}</code></pre>
              <p>Run this script passing the parameters after the double-dash: <br>
              <code>./ns3 run "scratch/my-script --nPackets=10"</code></p>
            `
          },
          {
            id: "T1-M6-L3",
            title: "6.3 Overview of the Tracing System",
            moduleTitle: "Track 1 • Module 6 • Lesson 3",
            body: `
              <p>The ns-3 tracing system separates data production from data consumption. It uses two concepts:</p>
              <ul>
                <li><strong>Trace Source:</strong> An event hook inside core code (e.g. <code>CourseChange</code> in mobility models). When triggered, it calls any connected callback function, passing variables.</li>
                <li><strong>Trace Sink:</strong> A user callback function connected to a Source to record or process the variables.</li>
              </ul>
            `
          },
          {
            id: "T1-M6-Q",
            title: "Module 6 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 1 • Module 6 • Assessment",
            quiz: [
              {
                question: "1. Which environment variable triggers ns-3 debug log filtering on the console?",
                options: [
                  { text: "NS_DEBUG", isCorrect: false },
                  { text: "NS_LOG", isCorrect: true },
                  { text: "LOG_LEVEL", isCorrect: false }
                ],
                feedbackSuccess: "Correct! The NS_LOG environment variable specifies logging components and levels.",
                feedbackError: "Incorrect. The variable is NS_LOG. Try again!"
              },
              {
                question: "2. Which logging level output includes logical function trace tracking?",
                options: [
                  { text: "level_info", isCorrect: false },
                  { text: "level_logic", isCorrect: true },
                  { text: "level_error", isCorrect: false }
                ],
                feedbackSuccess: "Correct! level_logic traces function entry/exit execution paths.",
                feedbackError: "Incorrect. Logic-level tracing is enabled with level_logic or level_all. Try again!"
              },
              {
                question: "3. How are script parameters separated from simulator parameters in the command line?",
                options: [
                  { text: "Using a double-dash ( -- )", isCorrect: true },
                  { text: "Using a colon ( : )", isCorrect: false },
                  { text: "Using export commands", isCorrect: false }
                ],
                feedbackSuccess: "Correct! -- separates build runner arguments from script arguments.",
                feedbackError: "Incorrect. Use a double-dash ( -- ) to separate arguments. Try again!"
              },
              {
                question: "4. What class binds command-line variables to script attributes?",
                options: [
                  { text: "CommandLine", isCorrect: true },
                  { text: "Config", isCorrect: false },
                  { text: "Parser", isCorrect: false }
                ],
                feedbackSuccess: "Correct! CommandLine manages parameter bindings.",
                feedbackError: "Incorrect. The class is CommandLine. Try again!"
              },
              {
                question: "5. What is a Trace Sink in ns-3?",
                options: [
                  { text: "A user callback function that receives data from a Trace Source", isCorrect: true },
                  { text: "A physical cable modeled in simulation", isCorrect: false },
                  { text: "A method to delete nodes", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Trace Sinks consume values exported by Trace Sources.",
                feedbackError: "Incorrect. A Trace Sink is a callback function that registers to capture source data. Try again!"
              }
            ]
          },
          {
            id: "T1-M6-A",
            title: "Module 6 Programming Assignment",
            isAssignmentOnly: true,
            moduleTitle: "Track 1 • Module 6 • Assignment",
            assignmentInstructions: `
              <h4>Assignment Objective:</h4>
              <p>Configure dynamic console logs using the <code>NS_LOG</code> environment variable and run the CSMA simulation.</p>
              
              <h4>Step 1: Open Terminal</h4>
              <p>Navigate to your ns-3 directory.</p>
              
              <h4>Step 2: Enable logs for UdpEchoClientApplication</h4>
              <p>Export the logging variable in your shell:</p>
              <pre><code>export NS_LOG="UdpEchoClientApplication=level_info"</code></pre>
              
              <h4>Step 3: Run the CSMA simulation and save output</h4>
              <p>Run the simulation and redirect output to <code>module6_output.txt</code>:</p>
              <pre><code>./ns3 run scratch/aerowlan_exercises/csma-simulation > scratch/aerowlan_exercises/module6_output.txt 2>&1</code></pre>
              
              <h4>Step 4: Submit output</h4>
              <p>Copy and paste the contents of <code>module6_output.txt</code> here to verify you successfully captured UdpEchoClient console output.</p>
            `,
            assignmentVerifyKeyword: "Sent 1024 bytes",
            practiceFile: "scratch/aerowlan_exercises/csma-simulation.cc"
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
              <p>Let's look at how <code>second.cc</code> constructs a shared bus LAN connected to a point-to-point link:</p>
              <pre><code>NodeContainer p2pNodes;
p2pNodes.Create (2);

NodeContainer csmaNodes;
csmaNodes.Add (p2pNodes.Get (1)); // Node 1 is shared between networks
csmaNodes.Create (3); // Total 4 nodes on CSMA LAN</code></pre>
              <p>This links both networks, allowing packets to hop from a P2P node, through Node 1, onto the CSMA network.</p>
            `
          },
          {
            id: "T1-M7-L2",
            title: "7.3 Wireless Network Topology (third.cc)",
            moduleTitle: "Track 1 • Module 7 • Lesson 2",
            body: `
              <p>The <code>third.cc</code> simulation introduces a wireless network alongside the CSMA and Point-to-Point networks. We use <code>WifiHelper</code> and MAC helpers to establish the wireless link:</p>
              <pre><code>WifiHelper wifi;
wifi.SetStandard (WIFI_STANDARD_80211ac);

WifiMacHelper mac;
Ssid ssid = Ssid ("ns-3-ssid");
mac.SetType ("ns3::StaWifiMac", "Ssid", SsidValue (ssid));</code></pre>
              <p>This installs WiFi antennas and configures stations to associate with the Access Point.</p>
            `
          },
          {
            id: "T1-M7-L3",
            title: "7.4 Queues in ns-3",
            moduleTitle: "Track 1 • Module 7 • Lesson 3",
            body: `
              <p>Packets traversing network devices are stored in queues. ns-3 NetDevices implement queuing models (e.g. DropTailQueue) to manage congestion. If a queue fills up, incoming packets are dropped, simulating packet drops.</p>
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
              <p>The ns-3 tracing system allows users to hook into internal class events without editing module source files.</p>
              <h4>Key Elements:</h4>
              <ul>
                <li><strong>Trace Sources:</strong> Event generators inside class implementations. When triggered, they execute any registered callbacks.</li>
                <li><strong>Trace Sinks:</strong> User-defined callbacks that process data variables exported by Trace Sources.</li>
                <li><strong>Config Paths:</strong> String paths (e.g. <code>"/NodeList/0/DeviceList/*/$ns3::WifiNetDevice/Rx"</code>) used to bind Sinks to Sources.</li>
              </ul>
            `
          },
          {
            id: "T1-M8-L2",
            title: "8.3 Real Example & 8.4 Trace Helpers",
            moduleTitle: "Track 1 • Module 8 • Lesson 2",
            body: `
              <p>Let's look at how to trace state changes in code. For example, to track changes in a node's position:</p>
              <pre><code>void CourseChange (std::string context, Ptr&lt;const MobilityModel&gt; model)
{
  Vector position = model-&gt;GetPosition ();
  std::cout &lt;&lt; "Node moved to position: " &lt;&lt; position &lt;&lt; std::endl;
}</code></pre>
              <p>We bind this callback using <code>Config::Connect()</code>:</p>
              <pre><code>Config::Connect ("/NodeList/*/$ns3::MobilityModel/CourseChange", MakeCallback (&amp;CourseChange));</code></pre>
            `
          },
          {
            id: "T1-M8-L3",
            title: "8.5 Tracing Summary",
            moduleTitle: "Track 1 • Module 8 • Lesson 3",
            body: `
              <p>Helpers like <code>PointToPointHelper::EnablePcapAll()</code> handle trace bindings behind the scenes, creating standard <code>.pcap</code> output files automatically. Sinks can be connected globally or to specific instances.</p>
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
            title: "9.1 Motivation & 9.2 Example Code",
            moduleTitle: "Track 1 • Module 9 • Lesson 1",
            body: `
              <p>Simulators must collect statistical metrics (throughput, delay, jitter) to evaluate network performance.</p>
              <h4>Data Collection Framework (DCF):</h4>
              <p>The DCF allows developers to construct automated collection loops using Probe, Collector, and Aggregator classes. This enables exporting metrics directly to CSV files or database tables.</p>
            `
          },
          {
            id: "T1-M9-L2",
            title: "9.3 GnuplotHelper & 9.5 FileHelper",
            moduleTitle: "Track 1 • Module 9 • Lesson 2",
            body: `
              <p>To visualize results quickly, ns-3 provides pre-built helpers:</p>
              <ul>
                <li><strong>GnuplotHelper:</strong> Automatically generates script files to plot graphs (throughput vs distance) using gnuplot.</li>
                <li><strong>FileHelper:</strong> Writes raw data streams directly to plaintext formatting columns, suitable for importing into tools like MATLAB or Python's Pandas.</li>
              </ul>
            `
          },
          {
            id: "T1-M9-L3",
            title: "9.4 Supported Trace Types & 9.6 Summary",
            moduleTitle: "Track 1 • Module 9 • Lesson 3",
            body: `
              <p>The DCF framework supports common types: integers, doubles, and string values. Using helper classes keeps reporting separate from core protocol logic.</p>
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
              <p>Congratulations! You have completed the ns-3 Master Class track.</p>
              <h4>10.1 Futures:</h4>
              <p>The ns-3 simulator is constantly evolving. Future releases plan to expand 5G/6G cellular models, integrate machine learning framework connections (such as ns3-gym), and enhance emulation modules.</p>
              <h4>10.2 Closing:</h4>
              <p>You are now ready to tackle complex wireless simulations in the next track: **Track 2: WiFi 7/8 Research Pro**!</p>
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
                <li><strong>YansWifiPhyHelper:</strong> Packet-based model. Simulates transmissions as single-channel blocks. It is fast and simple but cannot simulate frequency-selective fading or subcarrier allocation.</li>
                <li><strong>SpectrumWifiPhyHelper:</strong> Frequency-selective model. Simulates signal Power Spectral Density (PSD) across distinct subcarriers. This is required for modern multi-subcarrier standards (802.11ax/be) employing OFDMA and Multi-Link Operation.</li>
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
              <p><strong>Multi-Link Operation (MLO)</strong> allows a single Multi-Link Device (MLD) to utilize multiple physical links (e.g. 5 GHz and 6 GHz links) simultaneously.</p>
              <p>In ns-3.45, MLO is enabled by configuring multi-link devices using the <code>EhtFrameExchangeManager</code> and defining links on the <code>WifiHelper</code>:</p>
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
              <p>Adjacent APs coordinate transmit power dynamically. By backing off Tx power slightly, both APs can transmit simultaneously to nearby stations on the same channel, bypassing standard CCA threshold backoffs.</p>
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
  }
];

// Preprocess Track 1 modules to renumber 4-10 -> 1-7
function preprocessTracks() {
  const track1 = tracks[0];
  track1.modules.forEach(mod => {
    if (mod.id >= 5 && mod.id <= 10) {
      const oldId = mod.id;
      const newId = oldId - 3;
      mod.id = newId;
      mod.title = mod.title.replace(`Module ${oldId}:`, `Module ${newId}:`);
      
      mod.lessons.forEach(les => {
        les.id = les.id.replace(`T1-M${oldId}`, `T1-M${newId}`);
        les.moduleTitle = les.moduleTitle.replace(`Module ${oldId}`, `Module ${newId}`);
        if (les.title) {
          les.title = les.title.replace(`${oldId}.`, `${newId}.`);
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
  const currentTheme = localStorage.getItem('obsidian_theme') || 'dark';
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');
  
  if (currentTheme === 'light') {
    body.classList.add('light-theme');
    if (themeIcon) themeIcon.setAttribute('data-lucide', 'moon');
  } else {
    body.classList.remove('light-theme');
    if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
  }
}

window.toggleTheme = function() {
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');
  
  if (body.classList.contains('light-theme')) {
    body.classList.remove('light-theme');
    localStorage.setItem('obsidian_theme', 'dark');
    if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
  } else {
    body.classList.add('light-theme');
    localStorage.setItem('obsidian_theme', 'light');
    if (themeIcon) themeIcon.setAttribute('data-lucide', 'moon');
  }
  if (window.lucide) window.lucide.createIcons();
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
  const activeTrack = tracks[currentTrackIndex];
  for (let m = 0; m < mIdx; m++) {
    const prevMod = activeTrack.modules[m];
    // Must complete the very last element (usually the final quiz or assignment)
    const lastLesson = prevMod.lessons[prevMod.lessons.length - 1];
    if (!progress.completedLessons.includes(lastLesson.id)) {
      return true;
    }
  }
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

  activeTrack.modules.forEach((mod, mIdx) => {
    const modHeader = document.createElement('div');
    modHeader.style.fontWeight = 'bold';
    modHeader.style.fontSize = '12px';
    modHeader.style.color = '#e5e7eb';
    modHeader.style.marginTop = mIdx > 0 ? '12px' : '0';
    modHeader.style.marginBottom = '6px';
    modHeader.innerText = `${mod.title}`;
    container.appendChild(modHeader);

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
        item.onclick = () => selectLesson(mIdx, lIdx);
      } else {
        item.style.opacity = '0.5';
        item.style.cursor = 'not-allowed';
      }
      container.appendChild(item);
    });
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
    summary: "Create nodes and output logs.",
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

NS_LOG_COMPONENT_DEFINE ("AeroWlanHelloNodes");

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  Time::SetResolution (Time::NS);

  NodeContainer nodes;
  nodes.Create (2);

  std::cout << "Hello World from ns-3! Created " << nodes.GetN() << " nodes." << std::endl;

  return 0;
}
`,
    hints: [
      "You need to write the <code>int main(int argc, char *argv[])</code> function definition.",
      "Declare the container: <code>NodeContainer nodes;</code>",
      "Instantiate 2 nodes: <code>nodes.Create (2);</code>",
      "Print output: <code>std::cout << \"Hello World from ns-3! Created \" << nodes.GetN() << \" nodes.\" << std::endl;</code>"
    ]
  },
  {
    id: "basic-p2p",
    title: "2. Point-to-Point Link",
    difficulty: "Basic",
    difficultyClass: "difficulty-basic",
    summary: "Establish a standard point-to-point link.",
    description: `<p><strong>Objective:</strong> Set up a Point-to-Point link between 2 nodes.</p>
                  <p>Configure the link with a data rate of <code>"10Mbps"</code> and a propagation delay of <code>"5ms"</code>.</p>
                  <p>Use the [[PointToPointHelper]] to set attributes and install on your [[NodeContainer]].</p>`,
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

  PointToPointHelper pointToPoint;
  pointToPoint.SetDeviceAttribute ("DataRate", StringValue ("10Mbps"));
  pointToPoint.SetChannelAttribute ("Delay", StringValue ("5ms"));

  NetDeviceContainer devices;
  devices = pointToPoint.Install (nodes);

  std::cout << "Point-to-Point Link configured between 2 nodes." << std::endl;
  return 0;
}
`,
    hints: [
      "Implement `main` and declare a 2-node `NodeContainer nodes;`.",
      "Initialize helper: <code>PointToPointHelper pointToPoint;</code>",
      "Set attributes: <code>pointToPoint.SetDeviceAttribute (\"DataRate\", StringValue (\"10Mbps\"));</code>",
      "Set delay attribute: <code>pointToPoint.SetChannelAttribute (\"Delay\", StringValue (\"5ms\"));</code>",
      "Install on nodes: <code>NetDeviceContainer devices = pointToPoint.Install (nodes);</code>"
    ]
  },
  {
    id: "intermediate-csma",
    title: "3. Multi-Node Bus (CSMA)",
    difficulty: "Intermediate",
    difficultyClass: "difficulty-intermediate",
    summary: "Configure CSMA multi-node bus topology.",
    description: `<p><strong>Objective:</strong> Create a bus topology of 5 nodes using CSMA.</p>
                  <p>Configure the CSMA channel with a data rate of <code>"100Mbps"</code> and a propagation delay of <code>"6560ns"</code>.</p>
                  <p>Link all nodes using the [[CsmaHelper]].</p>`,
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
  nodes.Create (5);

  CsmaHelper csma;
  csma.SetChannelAttribute ("DataRate", StringValue ("100Mbps"));
  csma.SetChannelAttribute ("Delay", TimeValue (NanoSeconds (6560)));

  NetDeviceContainer devices;
  devices = csma.Install (nodes);

  std::cout << "CSMA Bus topology initialized with 5 nodes." << std::endl;
  return 0;
}
`,
    hints: [
      "Declare 5 nodes: `nodes.Create(5);`.",
      "Use CsmaHelper: <code>CsmaHelper csma;</code>",
      "Set channel delay: <code>csma.SetChannelAttribute (\"Delay\", TimeValue (NanoSeconds (6560)));</code>",
      "Install devices: <code>NetDeviceContainer devices = csma.Install (nodes);</code>"
    ]
  },
  {
    id: "intermediate-wifi",
    title: "4. Basic 802.11n Channel",
    difficulty: "Intermediate",
    difficultyClass: "difficulty-intermediate",
    summary: "Bootstrap a basic wireless station.",
    description: `<p><strong>Objective:</strong> Configure a wireless access point and 2 stations using IEEE 802.11n.</p>
                  <p>Use [[WifiHelper]] and set standard to <code>WIFI_STANDARD_80211n</code>.</p>
                  <p>Set up an SSID <code>"lab-ssid"</code> on both the AP and STA MAC layers.</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/wifi-module.h"
#include "ns3/mobility-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/wifi-module.h"
#include "ns3/mobility-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer wifiApNode;
  wifiApNode.Create (1);
  NodeContainer wifiStaNodes;
  wifiStaNodes.Create (2);

  YansWifiChannelHelper channel = YansWifiChannelHelper::Default ();
  YansWifiPhyHelper phy;
  phy.SetChannel (channel.Create ());

  WifiHelper wifi;
  wifi.SetStandard (WIFI_STANDARD_80211n);
  wifi.SetRemoteStationManager ("ns3::ConstantRateWifiManager");

  WifiMacHelper mac;
  Ssid ssid = Ssid ("lab-ssid");

  mac.SetType ("ns3::StaWifiMac", "Ssid", SsidValue (ssid));
  NetDeviceContainer staDevices = wifi.Install (phy, mac, wifiStaNodes);

  mac.SetType ("ns3::ApWifiMac", "Ssid", SsidValue (ssid));
  NetDeviceContainer apDevice = wifi.Install (phy, mac, wifiApNode);

  std::cout << "WiFi Setup complete: 1 AP, 2 STAs configured." << std::endl;
  return 0;
}
`,
    hints: [
      "Set wifi standard: <code>wifi.SetStandard (WIFI_STANDARD_80211n);</code>",
      "Create SSID: <code>Ssid ssid = Ssid (\"lab-ssid\");</code>",
      "Set STA MAC: <code>mac.SetType (\"ns3::StaWifiMac\", \"Ssid\", SsidValue (ssid));</code> and install: <code>NetDeviceContainer staDevices = wifi.Install (phy, mac, wifiStaNodes);</code>",
      "Set AP MAC: <code>mac.SetType (\"ns3::ApWifiMac\", \"Ssid\", SsidValue (ssid));</code> and install: <code>NetDeviceContainer apDevice = wifi.Install (phy, mac, wifiApNode);</code>"
    ]
  },
  {
    id: "advanced-mlo",
    title: "5. WiFi 7 Multi-Link Setup",
    difficulty: "Advanced",
    difficultyClass: "difficulty-advanced",
    summary: "Set up Multi-Link Operation (MLO) for WiFi 7.",
    description: `<p><strong>Objective:</strong> Configure Multi-Link Operation (MLO) using <code>WIFI_STANDARD_80211be</code> (WiFi 7).</p>
                  <p>Instantiate a 2-link [[SpectrumWifiPhyHelper]] phy(2), configure channel settings for 5 GHz and 6 GHz, and install links dynamically.</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/wifi-module.h"
#include "ns3/spectrum-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/wifi-module.h"
#include "ns3/spectrum-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer wifiAp;
  wifiAp.Create (1);
  NodeContainer wifiSta;
  wifiSta.Create (1);

  SpectrumWifiPhyHelper phy (2);
  auto spectrumChannel = CreateObject<MultiModelSpectrumChannel> ();
  
  phy.Set (0, "ChannelSettings", StringValue ("{0, 20, BAND_5GHZ, 0}"));
  phy.AddChannel (spectrumChannel, WIFI_SPECTRUM_5_GHZ);
  
  phy.Set (1, "ChannelSettings", StringValue ("{0, 20, BAND_6GHZ, 0}"));
  phy.AddChannel (spectrumChannel, WIFI_SPECTRUM_6_GHZ);

  WifiHelper wifi;
  wifi.SetStandard (WIFI_STANDARD_80211be);

  WifiMacHelper mac;
  Ssid ssid = Ssid ("mlo-ssid");

  mac.SetType ("ns3::StaWifiMac", "Ssid", SsidValue (ssid));
  NetDeviceContainer staDevices = wifi.Install (phy, mac, wifiSta);

  mac.SetType ("ns3::ApWifiMac", "Ssid", SsidValue (ssid));
  NetDeviceContainer apDevice = wifi.Install (phy, mac, wifiAp);

  std::cout << "WiFi 7 MLO Simulation Setup Complete." << std::endl;
  return 0;
}
`,
    hints: [
      "Initialize physical links: <code>SpectrumWifiPhyHelper phy (2);</code>",
      "Set settings for Link 0: <code>phy.Set (0, \"ChannelSettings\", StringValue (\"{0, 20, BAND_5GHZ, 0}\"));</code>",
      "Add spectrum channels: <code>auto ch = CreateObject<MultiModelSpectrumChannel>(); phy.AddChannel (ch, WIFI_SPECTRUM_5_GHZ);</code>",
      "Assign SSID and install using <code>wifi.Install (phy, mac, nodes);</code>"
    ]
  },
  {
    id: "pro-cosr",
    title: "6. WiFi 8 Coordinated Spatial Reuse",
    difficulty: "Pro",
    difficultyClass: "difficulty-pro",
    summary: "Prototype WiFi 8 candidates with overlapping BSS.",
    description: `<p><strong>Objective:</strong> Prototype Coordinated Spatial Reuse (CoSR) in an overlapping BSS (OBSS) topology.</p>
                  <p>Design spatial coordinates using [[MobilityHelper]] with AP1 at <code>(0,0)</code>, AP2 at <code>(40,0)</code>, STA1 at <code>(10,0)</code>, and STA2 at <code>(30,0)</code>.</p>`,
    template: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/wifi-module.h"
#include "ns3/mobility-module.h"
#include <iostream>

using namespace ns3;

// Write your code here
`,
    solution: `#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/wifi-module.h"
#include "ns3/mobility-module.h"
#include <iostream>

using namespace ns3;

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  NodeContainer apNodes;
  apNodes.Create (2);
  NodeContainer staNodes;
  staNodes.Create (2);

  SpectrumWifiPhyHelper phy;
  auto spectrumChannel = CreateObject<MultiModelSpectrumChannel> ();
  phy.SetChannel (spectrumChannel);

  WifiHelper wifi;
  wifi.SetStandard (WIFI_STANDARD_80211be); // Base Wifi 7 standard for WiFi 8 prototyping

  WifiMacHelper mac;
  
  // Set up Cell 1 (AP 0, STA 0)
  Ssid ssid1 = Ssid ("cell-a");
  mac.SetType ("ns3::StaWifiMac", "Ssid", SsidValue (ssid1));
  NetDeviceContainer staDev1 = wifi.Install (phy, mac, staNodes.Get (0));
  mac.SetType ("ns3::ApWifiMac", "Ssid", SsidValue (ssid1));
  NetDeviceContainer apDev1 = wifi.Install (phy, mac, apNodes.Get (0));

  // Set up Cell 2 (AP 1, STA 1)
  Ssid ssid2 = Ssid ("cell-b");
  mac.SetType ("ns3::StaWifiMac", "Ssid", SsidValue (ssid2));
  NetDeviceContainer staDev2 = wifi.Install (phy, mac, staNodes.Get (1));
  mac.SetType ("ns3::ApWifiMac", "Ssid", SsidValue (ssid2));
  NetDeviceContainer apDev2 = wifi.Install (phy, mac, apNodes.Get (1));

  // Configure Coordinates: AP1 at (0,0), AP2 at (40,0)
  MobilityHelper mobility;
  Ptr<ListPositionAllocator> positionAlloc = CreateObject<ListPositionAllocator> ();
  positionAlloc->Add (Vector (0.0, 0.0, 0.0));   // AP 1
  positionAlloc->Add (Vector (40.0, 0.0, 0.0));  // AP 2
  positionAlloc->Add (Vector (10.0, 0.0, 0.0));  // STA 1
  positionAlloc->Add (Vector (30.0, 0.0, 0.0));  // STA 2
  mobility.SetPositionAllocator (positionAlloc);
  mobility.SetMobilityModel ("ns3::ConstantPositionMobilityModel");
  mobility.Install (apNodes);
  mobility.Install (staNodes);

  std::cout << "WiFi 8 CoSR OBSS topology initialized." << std::endl;
  return 0;
}
`,
    hints: [
      "Use position allocator: <code>Ptr<ListPositionAllocator> positionAlloc = CreateObject<ListPositionAllocator> ();</code>",
      "Add positions in order: <code>positionAlloc->Add (Vector (0.0, 0.0, 0.0));</code> for AP1, then AP2 `(40.0, 0.0, 0.0)`, STA1 `(10.0, 0.0, 0.0)`, and STA2 `(30.0, 0.0, 0.0)`.",
      "Install mobility: <code>mobility.SetMobilityModel (\"ns3::ConstantPositionMobilityModel\"); mobility.Install (apNodes); mobility.Install (staNodes);</code>"
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
    li.innerHTML = prob.hints[currentRevealedHintIndex];
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
