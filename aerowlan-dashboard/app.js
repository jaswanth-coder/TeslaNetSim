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
  completedLessons: [] // Array of completed lesson IDs (e.g. "T1-M1-L1", "T1-M1-Q")
};

// Course Tracks Data Structure
const tracks = [
  {
    name: "Track 1: ns-3 Master Class (General & Wired)",
    modules: [
      {
        id: 1,
        title: "Module 1: ns-3 Core Abstractions",
        description: "Discrete-event simulation engine, smart pointers, nodes, devices, and attributes.",
        lessons: [
          {
            id: "T1-M1-L1",
            title: "Discrete-Event Simulation (DES) Mechanics",
            moduleTitle: "Track 1 • Module 1 • Lesson 1",
            body: `
              <p>ns-3 is a <strong>Discrete-Event Network Simulator</strong>. Unlike real-world hardware or emulators (like Mininet) that execute in real-time, ns-3 maintains an internal event queue sorted chronologically by virtual execution time.</p>
              <h4>How the DES Engine Operates:</h4>
              <ul>
                <li><strong>Events:</strong> An event is a C++ callback scheduled to execute at a specific future virtual time.</li>
                <li><strong>Virtual Simulation Time:</strong> The simulation clock does not tick continuously. Instead, when an event completes, the clock jumps instantly to the timestamp of the next event in the queue.</li>
                <li><strong>Lifecycle APIs:</strong> 
                  <ul>
                    <li><code>Simulator::Schedule()</code>: Registers a new event callback in the event queue.</li>
                    <li><code>Simulator::Run()</code>: Commences the execution loop, pulling and running events until none remain or a stop time is reached.</li>
                    <li><code>Simulator::Stop()</code>: Instructs the simulation loop to halt execution at a specific virtual time.</li>
                    <li><code>Simulator::Destroy()</code>: Cleans up internal structures, deletes reference-counted smart pointer handles, and frees heap memory.</li>
                  </ul>
                </li>
              </ul>
              <p>By default, ns-3 operates at a nanosecond time resolution (<code>Time::NS</code>), but can be configured to picoseconds or seconds via <code>Time::SetResolution()</code> before scheduling events.</p>
            `,
            practiceFile: null,
            practiceCmd: null
          },
          {
            id: "T1-M1-L2",
            title: "Core Topology Abstractions",
            moduleTitle: "Track 1 • Module 1 • Lesson 2",
            body: `
              <p>The official ns-3 tutorial defines four fundamental abstractions that represent physical network components:</p>
              <ul>
                <li><strong>Node:</strong> Represented by the <code>Node</code> class. This is the shell of a computer (or router/switch). It is initially blank and has no protocol stack or interfaces.</li>
                <li><strong>NetDevice:</strong> Represented by subclasses of the <code>NetDevice</code> class (e.g. <code>CsmaNetDevice</code>). Equivalent to a physical Network Interface Card (NIC). It is installed on a Node and bound to a Channel.</li>
                <li><strong>Channel:</strong> Represented by subclasses of the <code>Channel</code> class (e.g. <code>CsmaChannel</code>). Models the physical transmission medium (wires, fibers, or radio spectrum).</li>
                <li><strong>Application:</strong> Represents software programs running on nodes that generate or consume network packets (e.g. <code>UdpEchoClient</code>).</li>
              </ul>
              <p>These components are connected in C++ to build any physical topology.</p>
            `,
            practiceFile: "scratch/aerowlan_exercises/hello-ns3.cc",
            practiceCmd: "./ns3 run scratch/aerowlan_exercises/hello-ns3"
          },
          {
            id: "T1-M1-L3",
            title: "Object System & Config Attributes",
            moduleTitle: "Track 1 • Module 1 • Lesson 3",
            body: `
              <p>To support advanced features like runtime configuration and trace collection, ns-3 implements a custom C++ Object System:</p>
              <ul>
                <li><strong>Smart Pointers (<code>Ptr&lt;T&gt;</code>):</strong> Implements reference-counted garbage collection, deleting objects automatically when their reference count drops to zero to prevent memory leaks.</li>
                <li><strong>TypeId:</strong> Registers class metadata at runtime, defining class names, parents, and configuration attributes.</li>
                <li><strong>Attribute System:</strong> Allows developers to configure member variables of modules dynamically (e.g., configuring channel delay or data rate) using values like <code>StringValue</code>, <code>TimeValue</code>, or <code>DoubleValue</code>.</li>
              </ul>
              <p>Attributes are set using class helpers: <code>p2p.SetChannelAttribute ("Delay", StringValue ("2ms"));</code></p>
            `,
            practiceFile: null,
            practiceCmd: null
          },
          {
            id: "T1-M1-Q",
            title: "Module 1 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 1 • Module 1 • Assessment",
            quiz: [
              {
                question: "1. In ns-3, how does the simulation clock advance during execution?",
                options: [
                  { text: "It advances in continuous real-time milliseconds", isCorrect: false },
                  { text: "It jumps instantly to the timestamp of the next scheduled event in the queue", isCorrect: true },
                  { text: "It ticks at a fixed frequency set by the CPU", isCorrect: false }
                ],
                feedbackSuccess: "Correct! The clock jumps discretely from event to event, bypassing idle periods.",
                feedbackError: "Incorrect. ns-3 is a discrete-event simulator; the clock jumps instantly to the next event's scheduled execution time. Try again!"
              },
              {
                question: "2. Which C++ class represents a physical Network Interface Card (NIC) in ns-3?",
                options: [
                  { text: "Node", isCorrect: false },
                  { text: "NetDevice", isCorrect: true },
                  { text: "Channel", isCorrect: false }
                ],
                feedbackSuccess: "Correct! NetDevice binds a node's software to a channel, mimicking a NIC.",
                feedbackError: "Incorrect. Node represents the computer, and Channel represents the medium. NetDevice is the NIC. Try again!"
              },
              {
                question: "3. What is the role of Ptr<T> in ns-3 development?",
                options: [
                  { text: "It allocates raw stack variables", isCorrect: false },
                  { text: "It manages class reference counts and automates heap cleanup", isCorrect: true },
                  { text: "It acts as a type casting utility", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Ptr<T> wraps raw C++ pointers, automatically freeing memory when unused.",
                feedbackError: "Incorrect. Ptr<T> is a smart pointer template used for automatic reference counting and garbage collection. Try again!"
              },
              {
                question: "4. Why is Simulator::Destroy() called at the end of a simulation script?",
                options: [
                  { text: "To compile the scratch files", isCorrect: false },
                  { text: "To halt the scheduler loop early", isCorrect: false },
                  { text: "To delete reference loops and free allocated object memory", isCorrect: true }
                ],
                feedbackSuccess: "Correct! Destroy() frees objects and clears references to prevent memory leaks.",
                feedbackError: "Incorrect. Simulator::Destroy() cleans up internal state and deletes allocated objects. Try again!"
              },
              {
                question: "5. How are configuration attributes modified without editing module source code?",
                options: [
                  { text: "Via the TypeId Attribute Subsystem using values like StringValue or DoubleValue", isCorrect: true },
                  { text: "By editing variables directly in the compiler headers", isCorrect: false },
                  { text: "By calling Simulator::Schedule()", isCorrect: false }
                ],
                feedbackSuccess: "Correct! The Attribute system allows dynamic adjustments to registered parameters.",
                feedbackError: "Incorrect. Attributes are configured using the TypeId subsystem via helpers or config paths. Try again!"
              }
            ]
          }
        ]
      },
      {
        id: 2,
        title: "Module 2: Getting Started & first.cc",
        description: "Analyzing module includes, C++ namespaces, logging components, and point-to-point topologies.",
        lessons: [
          {
            id: "T1-M2-L1",
            title: "Analysis of first.cc Includes & Namespaces",
            moduleTitle: "Track 1 • Module 2 • Lesson 1",
            body: `
              <p>Let's perform a detailed walkthrough of the official <code>first.cc</code> script, starting with the headers:</p>
              <pre><code>#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/internet-module.h"
#include "ns3/point-to-point-module.h"
#include "ns3/applications-module.h"</code></pre>
              <h4>Grouped Module Includes:</h4>
              <p>Rather than including hundreds of individual headers, ns-3 groups APIs into high-level modules (e.g. <code>core</code>, <code>network</code>). CMake automatically creates a unified header for each module containing all public classes.</p>
              <h4>C++ Namespace:</h4>
              <p>The code declares <code>using namespace ns3;</code>. All ns-3 classes, types, and functions are declared within the <code>ns3</code> namespace to prevent conflicts with standard C++ libraries (<code>std</code>) or external projects.</p>
            `,
            practiceFile: null,
            practiceCmd: null
          },
          {
            id: "T1-M2-L2",
            title: "Logging Component & CLI Configuration",
            moduleTitle: "Track 1 • Module 2 • Lesson 2",
            body: `
              <p>The next line in <code>first.cc</code> defines the logging module identifier:</p>
              <pre><code>NS_LOG_COMPONENT_DEFINE ("FirstScriptExample");</code></pre>
              <p>This registers the name <code>FirstScriptExample</code> in the logger registry. You can then toggle console logs at runtime using shell variables: <code>export NS_LOG="FirstScriptExample=level_all"</code>.</p>
              <h4>CommandLine Parser:</h4>
              <p>The script uses the <code>CommandLine</code> class to read terminal inputs:</p>
              <pre><code>CommandLine cmd (__FILE__);
cmd.Parse (argc, argv);</code></pre>
              <p>This parses script inputs, allowing you to override variables dynamically during run time (e.g., <code>--nNodes=10</code>).</p>
            `,
            practiceFile: null,
            practiceCmd: null
          },
          {
            id: "T1-M2-L3",
            title: "Building Topology & Deploying Applications",
            moduleTitle: "Track 1 • Module 2 • Lesson 3",
            body: `
              <p>The core script creates two nodes and links them using a point-to-point helper:</p>
              <pre><code>NodeContainer nodes;
nodes.Create (2);

PointToPointHelper pointToPoint;
pointToPoint.SetDeviceAttribute ("DataRate", StringValue ("5Mbps"));
pointToPoint.SetChannelAttribute ("Delay", StringValue ("2ms"));

NetDeviceContainer devices;
devices = pointToPoint.Install (nodes);</code></pre>
              <p>Next, the Internet protocol stack is installed, IP addresses are assigned, and a UDP Echo server/client app is deployed on Node 1 and Node 0 respectively.</p>
            `,
            practiceFile: "scratch/aerowlan_exercises/p2p-simulation.cc",
            practiceCmd: "./ns3 run scratch/aerowlan_exercises/p2p-simulation",
            isProgExercise: true,
            progInstructions: `
              <h4>💻 Programming Practice: Wired P2P Simulation</h4>
              <p>1. Open the file <code>scratch/aerowlan_exercises/p2p-simulation.cc</code> in your editor.</p>
              <p>2. Modify the link speed to <strong>10Mbps</strong> and channel delay to <strong>5ms</strong>.</p>
              <p>3. Compile the script and run it, redirecting the execution output to a validation file:</p>
              <pre><code>./ns3 build
./ns3 run scratch/aerowlan_exercises/p2p-simulation > scratch/aerowlan_exercises/module2_output.txt 2>&1</code></pre>
              <p>4. Once completed, tell the AI agent: <em>"Please check my Module 2 program execution"</em>.</p>
            `
          },
          {
            id: "T1-M2-Q",
            title: "Module 2 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 1 • Module 2 • Assessment",
            quiz: [
              {
                question: "1. Why does ns-3 group includes into files like core-module.h?",
                options: [
                  { text: "To optimize compiler execution times", isCorrect: false },
                  { text: "To group all public APIs of a directory into a single, high-granularity include file", isCorrect: true },
                  { text: "To import standard C++ library symbols", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Grouped includes simplify dependency management for script writers.",
                feedbackError: "Incorrect. Grouped includes wrap all public headers for that folder to make writing scripts easier. Try again!"
              },
              {
                question: "2. What is the scope resolution namespace used by ns-3?",
                options: [
                  { text: "std::", isCorrect: false },
                  { text: "ns3::", isCorrect: true },
                  { text: "netsim::", isCorrect: false }
                ],
                feedbackSuccess: "Correct! The ns3 namespace encloses all simulation classes and functions.",
                feedbackError: "Incorrect. The project uses the C++ 'ns3' namespace. Try again!"
              },
              {
                question: "3. What macro registers a logging component name inside first.cc?",
                options: [
                  { text: "NS_LOG_COMPONENT_DEFINE", isCorrect: true },
                  { text: "NS_LOG_INFO", isCorrect: false },
                  { text: "NS_LOG_WARN", isCorrect: false }
                ],
                feedbackSuccess: "Correct! NS_LOG_COMPONENT_DEFINE registers the identifier for dynamic logging configurations.",
                feedbackError: "Incorrect. NS_LOG_COMPONENT_DEFINE defines the string tag for the logging subsystem. Try again!"
              },
              {
                question: "4. What default port is configured for the UdpEchoServer application inside first.cc?",
                options: [
                  { text: "Port 80", isCorrect: false },
                  { text: "Port 9", isCorrect: true },
                  { text: "Port 443", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Port 9 is the default echo port used in the tutorial.",
                feedbackError: "Incorrect. The echo server is configured on port 9 in the tutorial code. Try again!"
              },
              {
                question: "5. Which helper class initializes standard command-line parameters in ns-3?",
                options: [
                  { text: "CommandLine", isCorrect: true },
                  { text: "Config", isCorrect: false },
                  { text: "InputParser", isCorrect: false }
                ],
                feedbackSuccess: "Correct! The CommandLine class parses script flags passed from the terminal.",
                feedbackError: "Incorrect. CommandLine is the class used to parse and bind script arguments. Try again!"
              }
            ]
          }
        ]
      },
      {
        id: 3,
        title: "Module 3: Wired Topologies & Tweaking",
        description: "Shared CSMA bus topologies, overlapping networks, and CLI parameter modifications.",
        lessons: [
          {
            id: "T1-M3-L1",
            title: "CSMA Shared Bus Topologies (second.cc)",
            moduleTitle: "Track 1 • Module 3 • Lesson 1",
            body: `
              <p>In the official <code>second.cc</code> script, a CSMA shared local area network is constructed. Unlike point-to-point links, CSMA connects multiple nodes to a single shared bus medium.</p>
              <h4>CSMA Channel Properties:</h4>
              <p>CSMA models a Carrier Sense Multiple Access channel with collisions, mimicking shared Ethernet. We configure its attributes via <code>CsmaHelper</code>:</p>
              <pre><code>CsmaHelper csma;
csma.SetChannelAttribute ("DataRate", StringValue ("100Mbps"));
csma.SetChannelAttribute ("Delay", TimeValue (NanoSeconds (6560)));</code></pre>
              <p>When installed on a NodeContainer, all nodes share the collision domain and must negotiate access via carrier sensing.</p>
            `,
            practiceFile: null,
            practiceCmd: null
          },
          {
            id: "T1-M3-L2",
            title: "Inter-Network Routing & ARP",
            moduleTitle: "Track 1 • Module 3 • Lesson 2",
            body: `
              <p>When connecting multiple networks (e.g. a P2P link bridging to a CSMA LAN), nodes must route packets across subnets. In ns-3, this is accomplished via static routing helpers:</p>
              <pre><code>Ipv4GlobalRoutingHelper::PopulateRoutingTables ();</code></pre>
              <p>This command automatically traverses all nodes, constructs static routing tables based on the configured subnets, and populates routing entries.</p>
              <p>Additionally, the Address Resolution Protocol (ARP) is modeled dynamically to map IPv4 addresses to NetDevice MAC addresses before transmitting packets.</p>
            `,
            practiceFile: "scratch/aerowlan_exercises/csma-simulation.cc",
            practiceCmd: "./ns3 run scratch/aerowlan_exercises/csma-simulation",
            isProgExercise: true,
            progInstructions: `
              <h4>💻 Programming Practice: CSMA Bus Simulation</h4>
              <p>1. Open <code>scratch/aerowlan_exercises/csma-simulation.cc</code>.</p>
              <p>2. Configure the CSMA nodes count to <strong>6</strong>.</p>
              <p>3. Compile the simulation and redirect output to a validation file:</p>
              <pre><code>./ns3 build
./ns3 run scratch/aerowlan_exercises/csma-simulation > scratch/aerowlan_exercises/module3_output.txt 2>&1</code></pre>
              <p>4. Once completed, tell the AI agent: <em>"Please check my Module 3 program execution"</em>.</p>
            `
          },
          {
            id: "T1-M3-Q",
            title: "Module 3 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 1 • Module 3 • Assessment",
            quiz: [
              {
                question: "1. What physical layer topology does CsmaHelper configure?",
                options: [
                  { text: "Point-to-Point link", isCorrect: false },
                  { text: "Shared Bus LAN", isCorrect: true },
                  { text: "Mesh network", isCorrect: false }
                ],
                feedbackSuccess: "Correct! CSMA models a multi-tap bus medium.",
                feedbackError: "Incorrect. CsmaHelper configures a shared bus topology. Try again!"
              },
              {
                question: "2. How are routing tables populated automatically across multiple subnets in ns-3?",
                options: [
                  { text: "Via Ipv4GlobalRoutingHelper::PopulateRoutingTables()", isCorrect: true },
                  { text: "Manually for each device", isCorrect: false },
                  { text: "By default during IP stack installation", isCorrect: false }
                ],
                feedbackSuccess: "Correct! PopulateRoutingTables() automatically configures static routes for all subnets.",
                feedbackError: "Incorrect. You must call Ipv4GlobalRoutingHelper::PopulateRoutingTables() to build tables. Try again!"
              },
              {
                question: "3. What protocol resolves IP addresses to physical MAC addresses in ns-3?",
                options: [
                  { text: "DNS", isCorrect: false },
                  { text: "ARP", isCorrect: true },
                  { text: "DHCP", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Address Resolution Protocol (ARP) is modeled dynamically on IPv4 interfaces.",
                feedbackError: "Incorrect. ARP maps layer-3 IP addresses to layer-2 MAC addresses. Try again!"
              },
              {
                question: "4. How can you toggle dynamic logging for UdpEchoClient application to display warnings only?",
                options: [
                  { text: "export NS_LOG='UdpEchoClientApplication=level_warn'", isCorrect: true },
                  { text: "export NS_LOG='UdpEchoClientApplication=all'", isCorrect: false },
                  { text: "CommandLine::AddValue()", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Assigning level_warn filters logs to warnings and errors.",
                feedbackError: "Incorrect. Set UdpEchoClientApplication to level_warn in your environment. Try again!"
              },
              {
                question: "5. What happens when two CSMA nodes transmit simultaneously on the same bus?",
                options: [
                  { text: "A collision is simulated and backoff events are triggered", isCorrect: true },
                  { text: "Packets are merged cleanly on the channel", isCorrect: false },
                  { text: "The simulation crashes with an assertion error", isCorrect: false }
                ],
                feedbackSuccess: "Correct! CSMA models medium contention and collisions dynamically.",
                feedbackError: "Incorrect. CSMA simulates standard Ethernet collisions and backoffs. Try again!"
              }
            ]
          }
        ]
      },
      {
        id: 4,
        title: "Module 4: Tracing System & Data Collection",
        description: "Configuring packet captures, reading trace files with tcpdump, and callback trace matching.",
        lessons: [
          {
            id: "T1-M4-L1",
            title: "Trace Sources and Trace Sinks",
            moduleTitle: "Track 1 • Module 4 • Lesson 1",
            body: `
              <p>The ns-3 simulator provides a structured **Tracing System** that separates data generation from data analysis, preventing log printing from cluttering core module code.</p>
              <h4>Key Concepts:</h4>
              <ul>
                <li><strong>Trace Source:</strong> An event hook inside a class (e.g. <code>MacTx</code>, <code>RxDrop</code>) that fires when state changes, exporting relevant variables (e.g. packet size, node ID).</li>
                <li><strong>Trace Sink:</strong> A callback function defined by the user that receives the exported variables from the Source and logs them to console or files.</li>
              </ul>
              <p>Sinks are connected to Sources using config paths: <code>Config::Connect()</code>.</p>
            `,
            practiceFile: null,
            practiceCmd: null
          },
          {
            id: "T1-M4-L2",
            title: "PCAP & ASCII Trace Helpers",
            moduleTitle: "Track 1 • Module 4 • Lesson 2",
            body: `
              <p>To record standard packets for external analysis (e.g. Wireshark or tcpdump), ns-3 provides pre-built trace helpers:</p>
              <ul>
                <li><strong>ASCII Traces:</strong> Write every event (Tx, Rx, Drop) as detailed plaintext lines. Enabled via:<br>
                  <code>AsciiTraceHelper ascii; p2p.EnableAsciiAll(ascii.CreateFileStream("p2p.tr"));</code>
                </li>
                <li><strong>PCAP Traces:</strong> Save raw packet frames in Libpcap format. Enabled via:<br>
                  <code>p2p.EnablePcapAll("p2p-capture");</code>
                </li>
              </ul>
              <p>On Linux, you inspect generated PCAPs directly on the shell using <code>tcpdump</code>: <code>tcpdump -nn -tt -r p2p-capture-0-0.pcap</code>.</p>
            `,
            practiceFile: "scratch/aerowlan_exercises/simple-wifi.cc",
            practiceCmd: "./ns3 run scratch/aerowlan_exercises/simple-wifi -- --pcap=1",
            isProgExercise: true,
            progInstructions: `
              <h4>💻 Programming Practice: Trace File Inspection</h4>
              <p>1. Compile and execute the <code>simple-wifi.cc</code> script with packet capture enabled:</p>
              <pre><code>./ns3 run scratch/aerowlan_exercises/simple-wifi -- --pcap=1</code></pre>
              <p>2. Locate the generated <code>.pcap</code> files in your workspace root.</p>
              <p>3. Read the packet headers of the first PCAP file using tcpdump, and redirect the output to a validation file:</p>
              <pre><code>tcpdump -nn -tt -r TeslaSimpleWifi-0-0.pcap > scratch/aerowlan_exercises/module4_output.txt 2>&1</code></pre>
              <p>4. Once completed, tell the AI agent: <em>"Please check my Module 4 trace output"</em>.</p>
            `
          },
          {
            id: "T1-M4-Q",
            title: "Module 4 Review Quiz",
            isQuizOnly: true,
            moduleTitle: "Track 1 • Module 4 • Assessment",
            quiz: [
              {
                question: "1. What is the main design goal of the ns-3 Tracing System?",
                options: [
                  { text: "To accelerate simulation compile speed", isCorrect: false },
                  { text: "To decouple data generation (sources) from data analysis (sinks)", isCorrect: true },
                  { text: "To configure class attributes dynamically", isCorrect: false }
                ],
                feedbackSuccess: "Correct! decoupling sources from sinks keeps core code free from logging statements.",
                feedbackError: "Incorrect. The tracing system decouples data production from consumption. Try again!"
              },
              {
                question: "2. Which file format allows ns-3 traces to be opened directly in Wireshark?",
                options: [
                  { text: "Plaintext .tr files", isCorrect: false },
                  { text: "Libpcap .pcap files", isCorrect: true },
                  { text: "XML simulation files", isCorrect: false }
                ],
                feedbackSuccess: "Correct! PCAP files match the standard packet capture format readable by Wireshark.",
                feedbackError: "Incorrect. Wireshark reads standard Libpcap .pcap files. Try again!"
              },
              {
                question: "3. What Linux tool is used on the terminal to view packet contents of a PCAP file?",
                options: [
                  { text: "tcpdump", isCorrect: true },
                  { text: "cat", isCorrect: false },
                  { text: "grep", isCorrect: false }
                ],
                feedbackSuccess: "Correct! tcpdump parses and displays packet records on the CLI.",
                feedbackError: "Incorrect. tcpdump is the standard CLI packet analyzer tool. Try again!"
              },
              {
                question: "4. What is a Trace Source in ns-3 class models?",
                options: [
                  { text: "A callback function that prints reports", isCorrect: false },
                  { text: "An event hook that signals state changes and exports data variables", isCorrect: true },
                  { text: "A channel parameter setting transmitter power", isCorrect: false }
                ],
                feedbackSuccess: "Correct! Trace Sources are variables/hooks that trigger callbacks when state changes.",
                feedbackError: "Incorrect. Trace Source is the generation hook inside core modules. Try again!"
              },
              {
                question: "5. How do you enable PCAP capture on all devices configured via PointToPointHelper?",
                options: [
                  { text: "p2p.EnablePcapAll(\"prefix\");", isCorrect: true },
                  { text: "p2p.SetChannelAttribute(\"Pcap\", true);", isCorrect: false },
                  { text: "Config::Connect(\"Pcap\");", isCorrect: false }
                ],
                feedbackSuccess: "Correct! EnablePcapAll() sets up capturing hooks for all devices managed by the helper.",
                feedbackError: "Incorrect. Use EnablePcapAll(\"prefix\") on the helper instance. Try again!"
              }
            ]
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
            `,
            practiceFile: null,
            practiceCmd: null
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
                <li><strong>ThreeGppChannelModel:</strong> Advanced 3GPP-standard channel modeling path loss, spatial fading, and shadowing dynamically.</li>
              </ul>
              <p>Propagation delay models (e.g. <code>ConstantSpeedPropagationDelayModel</code>) calculate signal travel time based on the speed of light.</p>
            `,
            practiceFile: "scratch/aerowlan_exercises/simple-wifi.cc",
            practiceCmd: "./ns3 run scratch/aerowlan_exercises/simple-wifi",
            isProgExercise: true,
            progInstructions: `
              <h4>💻 Programming Practice: Propagation Loss Test</h4>
              <p>1. Open <code>scratch/aerowlan_exercises/simple-wifi.cc</code>.</p>
              <p>2. Locate the mobility section and change STA 2's position from <strong>(20.0, 0.0, 0.0)</strong> to <strong>(100.0, 0.0, 0.0)</strong>.</p>
              <p>3. Execute the simulation and save the stdout log to verify if packets still reach STA 2 at 100 meters under Friis loss:</p>
              <pre><code>./ns3 run scratch/aerowlan_exercises/simple-wifi > scratch/aerowlan_exercises/module5_output.txt 2>&1</code></pre>
              <p>4. Once completed, tell the AI agent: <em>"Please check my Module 5 (Track 2 Mod 1) output"</em>.</p>
            `
          },
          {
            id: "T2-M1-Q",
            title: "Module 1 Review Quiz",
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
                question: "3. What three frequency bands are supported in modern WiFi 7 (802.11be) models in ns-3?",
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
              <p>When a station has multiple traffic types, it queues them in separate EDCA buffers, competing internally before contending for the physical channel.</p>
            `,
            practiceFile: null,
            practiceCmd: null
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
              <p>In ns-3, aggregation thresholds are attributes on the MAC object (e.g. <code>MaxAmpduSize</code>) and can be set to optimize spectral efficiency.</p>
            `,
            practiceFile: "scratch/aerowlan_exercises/simple-wifi.cc",
            practiceCmd: "./ns3 run scratch/aerowlan_exercises/simple-wifi",
            isProgExercise: true,
            progInstructions: `
              <h4>💻 Programming Practice: QoS Packet Mapping</h4>
              <p>1. Open <code>scratch/aerowlan_exercises/simple-wifi.cc</code>.</p>
              <p>2. Locate the echo client application setup.</p>
              <p>3. Configure the socket TOS (Type of Service) attribute to map client packets to <strong>AC_VO (TOS = 0xc0)</strong>:</p>
              <pre><code>echoClient.SetAttribute ("Tos", UintegerValue (0xc0));</code></pre>
              <p>4. Execute the simulation and save stdout to verify if the server logs reflect priority traffic:</p>
              <pre><code>./ns3 run scratch/aerowlan_exercises/simple-wifi > scratch/aerowlan_exercises/module6_output.txt 2>&1</code></pre>
              <p>5. Tell the AI agent: <em>"Please check my Module 6 (Track 2 Mod 2) output"</em>.</p>
            `
          },
          {
            id: "T2-M2-Q",
            title: "Module 2 Review Quiz",
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
          }
        ]
      },
      {
        id: 3,
        title: "Module 3: WiFi 7 (802.11be / EHT) & MLO",
        description: "Multi-Link Devices, 320 MHz channel allocation, 4096-QAM, and frame structures.",
        lessons: [
          {
            id: "T2-M3-L1",
            title: "Multi-Link Operation (MLO) Architecture",
            moduleTitle: "Track 2 • Module 3 • Lesson 1",
            body: `
              <p><strong>Multi-Link Operation (MLO)</strong> is a signature feature of IEEE 802.11be (WiFi 7). It allows a single Multi-Link Device (MLD) to utilize multiple physical channels (links) simultaneously across the 2.4 GHz, 5 GHz, and 6 GHz bands.</p>
              <h4>MLD Structure:</h4>
              <p>An MLD node has a single MAC interface exposed to the IP stack, but controls multiple independent MAC/PHY link instances. In ns-3, this is configured using <code>EhtFrameExchangeManager</code> and setting MLD properties on the <code>WifiHelper</code>:</p>
              <pre><code>wifi.SetStandard (WIFI_STANDARD_80211be);
wifi.SetMultiLinkType (WifiHelper::DEFAULT_MLD);</code></pre>
            `,
            practiceFile: null,
            practiceCmd: null
          },
          {
            id: "T2-M3-L2",
            title: "EHT PHY Layer Configurations",
            moduleTitle: "Track 2 • Module 3 • Lesson 2",
            body: `
              <p>WiFi 7 (Extremely High Throughput - EHT) expands physical layer capabilities:</p>
              <ul>
                <li><strong>320 MHz Channel Width:</strong> Doubles the 160 MHz limit of WiFi 6. Enabled using the 6 GHz band.</li>
                <li><strong>4096-QAM Modulation:</strong> Models 12 bits per symbol, yielding 20% higher peak rates. In ns-3, this corresponds to MCS indices 14 and 15 (e.g. <code>EhtMcs15</code>).</li>
                <li><strong>Multi-RU:</strong> Allows allocating multiple resource units to a single station to bypass channel interference.</li>
              </ul>
            `,
            practiceFile: "scratch/aerowlan_exercises/wifi7-mlo.cc",
            practiceCmd: "./ns3 run scratch/aerowlan_exercises/wifi7-mlo",
            isProgExercise: true,
            progInstructions: `
              <h4>💻 Programming Practice: WiFi 7 MLO Throughput Test</h4>
              <p>1. Open <code>scratch/aerowlan_exercises/wifi7-mlo.cc</code>.</p>
              <p>2. Locate the link configuration. Enable a 2-link setup and run the simulation.</p>
              <p>3. Redirect execution logs to a validation file:</p>
              <pre><code>./ns3 build
./ns3 run scratch/aerowlan_exercises/wifi7-mlo > scratch/aerowlan_exercises/module7_output.txt 2>&1</code></pre>
              <p>4. Tell the AI agent: <em>"Please check my Module 7 (Track 2 Mod 3) output"</em>.</p>
            `
          },
          {
            id: "T2-M3-Q",
            title: "Module 3 Review Quiz",
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
          }
        ]
      },
      {
        id: 4,
        title: "Module 4: WiFi 8 (802.11bn) & Advanced Research",
        description: "Coordinated Spatial Reuse (CoSR), Coordinated Beamforming (CoBF), and UHR scheduling models.",
        lessons: [
          {
            id: "T2-M4-L1",
            title: "Multi-AP Coordinated Spatial Reuse (CoSR)",
            moduleTitle: "Track 2 • Module 4 • Lesson 1",
            body: `
              <p>IEEE 802.11bn (WiFi 8), named **Ultra High Reliability (UHR)**, addresses cell edge performance in high-density environments. The primary solution is multi-AP coordination.</p>
              <h4>Coordinated Spatial Reuse (CoSR):</h4>
              <p>Under standard CSMA, overlapping cells (OBSS) must wait when a neighbor transmits. In CoSR, neighboring APs coordinate transmit power dynamically. By backing off Tx power slightly, both APs can transmit simultaneously to nearby stations on the same channel without causing packet collisions.</p>
            `,
            practiceFile: null,
            practiceCmd: null
          },
          {
            id: "T2-M4-L2",
            title: "Coordinated Beamforming & OFDMA",
            moduleTitle: "Track 2 • Module 4 • Lesson 2",
            body: `
              <p>In addition to CoSR, WiFi 8 researchers model physical-layer antenna coordination:</p>
              <ul>
                <li><strong>Coordinated Beamforming (CoBF):</strong> APs coordinate multi-antenna beamforming vectors to place a spatial "null" at the coordinates of neighboring stations, avoiding cross-talk.</li>
                <li><strong>Coordinated OFDMA (Co-OFDMA):</strong> APs partition the subcarrier spectrum orthogonally, allocating distinct subcarriers to OBSS stations.</li>
              </ul>
            `,
            practiceFile: "scratch/aerowlan_exercises/wifi8-cosr.cc",
            practiceCmd: "./ns3 run scratch/aerowlan_exercises/wifi8-cosr",
            isProgExercise: true,
            progInstructions: `
              <h4>💻 Programming Practice: WiFi 8 CoSR Simulation</h4>
              <p>1. Open <code>scratch/aerowlan_exercises/wifi8-cosr.cc</code>.</p>
              <p>2. Locate the OBSS configuration. Edit AP nodes placement to simulate cell overlaps.</p>
              <p>3. Execute the simulation and save stdout log to evaluate packet deliveries:</p>
              <pre><code>./ns3 build
./ns3 run scratch/aerowlan_exercises/wifi8-cosr > scratch/aerowlan_exercises/module8_output.txt 2>&1</code></pre>
              <p>4. Tell the AI agent: <em>"Please check my Module 8 (Track 2 Mod 4) output"</em>.</p>
            `
          },
          {
            id: "T2-M4-Q",
            title: "Module 4 Review Quiz",
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
          }
        ]
      }
    ]
  }
];

// Initialize Dashboard & Learning Hub
function init() {
  renderMilestones();
  renderSyllabus();
  loadLesson(currentModuleIndex, currentLessonIndex);
  updateProgressBar();
  lucide.createIcons();
}

// Render Milestones on Dashboard based on current Track
function renderMilestones() {
  const container = document.getElementById('dashboard-milestones');
  if (!container) return;
  container.innerHTML = '';

  const activeTrack = tracks[currentTrackIndex];
  document.getElementById('overall-progress-text').innerText = activeTrack.name;

  activeTrack.modules.forEach((mod, mIdx) => {
    let statusClass = '';
    let statusLabel = 'Locked';

    const isModuleActive = (mIdx === currentModuleIndex);
    const completedCount = mod.lessons.filter(l => progress.completedLessons.includes(l.id)).length;
    const isModuleCompleted = (completedCount === mod.lessons.length);

    if (isModuleCompleted) {
      statusClass = 'completed';
      statusLabel = 'Completed';
    } else if (isModuleActive) {
      statusClass = 'active';
      statusLabel = 'In Progress';
    }

    const item = document.createElement('div');
    item.className = 'milestone-item';
    item.innerHTML = `
      <div class="milestone-info">
        <div class="milestone-num ${statusClass === 'completed' ? 'completed' : (statusClass === 'active' ? 'active' : '')}">
          ${mIdx + 1}
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
    modHeader.innerText = `Module ${mod.id}: ${mod.title.split(":")[0]}`;
    container.appendChild(modHeader);

    mod.lessons.forEach((les, lIdx) => {
      const item = document.createElement('div');
      const isActive = (mIdx === currentModuleIndex && lIdx === currentLessonIndex);
      const isCompleted = progress.completedLessons.includes(les.id);

      item.className = `syllabus-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
      item.innerHTML = `
        <span>${les.isQuizOnly ? '📝 Quiz' : 'L' + (lIdx + 1) + ': ' + les.title}</span>
        ${isCompleted ? '<span>✓</span>' : ''}
      `;
      item.onclick = () => selectLesson(mIdx, lIdx);
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

  if (lesson.isQuizOnly) {
    bodyElement.innerHTML = `<p>This is the final assessment for this module. You must answer all 5 questions correctly to verify your understanding and unlock the next module.</p>
                             <div id="quiz-summary-state" style="margin-top: 10px; font-weight: 600; color: #fdba74;">
                               Question ${currentQuizQuestionIndex + 1} of ${lesson.quiz.length}
                             </div>`;
    practiceBox.style.display = 'none';
    quizBlock.style.display = 'block';
    
    // Load current quiz question
    loadQuizQuestion(lesson.quiz[currentQuizQuestionIndex]);
  } else {
    bodyElement.innerHTML = lesson.body;
    quizBlock.style.display = 'none';
    if (lesson.practiceFile) {
      practiceBox.style.display = 'block';
      
      // Inject programming instructions if exists
      if (lesson.isProgExercise) {
        practiceBox.innerHTML = lesson.progInstructions;
      } else {
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
      }
    } else {
      practiceBox.style.display = 'none';
    }
  }

  // Enable/disable navigation buttons
  document.getElementById('btn-prev-lesson').disabled = (mIdx === 0 && lIdx === 0);
  const isLastLesson = (mIdx === activeTrack.modules.length - 1 && lIdx === activeTrack.modules[mIdx].lessons.length - 1);
  document.getElementById('btn-next-lesson').disabled = isLastLesson;
}

// Load a specific question from 5-question array
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

// Track changer logic
function changeTrack() {
  const select = document.getElementById('track-selector');
  currentTrackIndex = parseInt(select.value);
  currentModuleIndex = 0;
  currentLessonIndex = 0;
  currentQuizQuestionIndex = 0;
  quizAnswersCorrect = 0;
  
  init();
}

// Copy to clipboard helpers
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

    // Add Next Question button after correct answer
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary mt-3';
    
    const isLastQuestion = (currentQuizQuestionIndex === lesson.quiz.length - 1);
    nextBtn.innerText = isLastQuestion ? "Complete Assessment" : "Next Question";
    
    nextBtn.onclick = () => {
      if (isLastQuestion) {
        // Assessment completed
        if (!progress.completedLessons.includes(lesson.id)) {
          progress.completedLessons.push(lesson.id);
          localStorage.setItem('tesla_netsim_progress', JSON.stringify(progress));
          updateProgressBar();
          renderMilestones();
          renderSyllabus();
        }
        
        // Show success screen
        document.getElementById('lesson-body').innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <h2 style="color: #10b981;">🎉 Module Complete!</h2>
            <p style="margin-top: 10px;">You have successfully passed the final assessment with a score of ${quizAnswersCorrect}/${lesson.quiz.length}.</p>
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
