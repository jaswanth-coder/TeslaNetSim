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
  // Remove active from all nav items and contents
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  // Add active to selected
  document.querySelector(`.nav-item[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(`${tabId}-tab`).classList.add('active');
}

// Course Modules Data - Scraped & Compiled Official ns-3 Tutorial Curriculum (from Basic to WiFi 7/8 Pro)
const modules = [
  {
    id: 1,
    title: "Module 1: ns-3 Core Architecture",
    description: "Discrete-event simulation mechanics, node-device-channel primitives, and the Object System.",
    lessons: [
      {
        id: "1.1",
        title: "Discrete-Event Simulation (DES) Engine",
        moduleTitle: "Module 1 • Lesson 1.1",
        body: `
          <p>The core of ns-3 is a <strong>Discrete-Event Simulator</strong>. Unlike real-time simulators, ns-3 maintains an internal event queue sorted by event execution time. The simulation clock represents virtual time, which jumps instantaneously from one event to the next.</p>
          <h4>Lifecycle of an Event:</h4>
          <ol>
            <li><strong>Scheduling:</strong> Events are created and scheduled using <code>Simulator::Schedule()</code>, which puts the event callback and its scheduled execution timestamp in the queue.</li>
            <li><strong>Execution Loop:</strong> Calling <code>Simulator::Run()</code> starts the loop. The simulator grabs the earliest event, advances the clock to that timestamp, and runs the callback function.</li>
            <li><strong>Memory Cleanup:</strong> After <code>Simulator::Run()</code> completes, <code>Simulator::Destroy()</code> must be called to free internal objects and prevent memory leaks.</li>
          </ol>
          <p>By default, ns-3 uses a nanosecond time resolution, but this can be adjusted to picoseconds or seconds via <code>Time::SetResolution()</code> before the simulation starts.</p>
        `,
        practiceFile: null,
        practiceCmd: null
      },
      {
        id: "1.2",
        title: "Core Simulator Abstractions",
        moduleTitle: "Module 1 • Lesson 1.2",
        body: `
          <p>The official ns-3 tutorial defines four key abstractions that mirror real-world networking equipment:</p>
          <ul>
            <li><strong>Node:</strong> Represented by the <code>Node</code> class. It acts as the computing shell (chassis) of a computer. We add network interfaces, protocol stacks, and applications to it.</li>
            <li><strong>NetDevice:</strong> Represented by the <code>NetDevice</code> base class. This is equivalent to a Network Interface Card (NIC) (e.g. Ethernet card, WiFi antenna). It is installed on a Node and bound to a Channel.</li>
            <li><strong>Channel:</strong> Represented by the <code>Channel</code> base class. Models the physical communication medium (e.g. coaxial cable, fiber optic, or airwaves).</li>
            <li><strong>Application:</strong> The user-space software that generates or consumes traffic (e.g. UDP Echo client/server, packet generator).</li>
          </ul>
        `,
        practiceFile: "scratch/aerowlan_exercises/hello-ns3.cc",
        practiceCmd: "./ns3 run scratch/aerowlan_exercises/hello-ns3",
      },
      {
        id: "1.3",
        title: "The Object System & Attributes",
        moduleTitle: "Module 1 • Lesson 1.3",
        body: `
          <p>ns-3 implements a custom Object System to provide features not natively present in standard C++:</p>
          <ul>
            <li><strong>Smart Pointers:</strong> Declared using <code>Ptr&lt;T&gt;</code>. It tracks reference counts and automatically deletes objects when they are no longer referenced, resolving C++ memory management complexity.</li>
            <li><strong>TypeId:</strong> Registers class names, parent classes, and metadata in the ns-3 config system. This allows runtime configuration and object instantiation via <code>CreateObject&lt;T&gt;()</code>.</li>
            <li><strong>Attribute System:</strong> Exposes member variables to the configuration subsystem. You can set them via helpers or config paths using classes like <code>StringValue</code>, <code>TimeValue</code>, or <code>DoubleValue</code>.</li>
          </ul>
          <p>Example: Configuring a channel delay dynamically without editing module source code:</p>
          <pre><code>PointToPointHelper p2p;
p2p.SetChannelAttribute ("Delay", StringValue ("2ms"));</code></pre>
        `,
        practiceFile: null,
        practiceCmd: null
      },
      {
        id: "Q1",
        title: "Module 1 Final Quiz",
        isQuizOnly: true,
        moduleTitle: "Module 1 • Assessment",
        quiz: {
          question: "Which class provides the runtime metadata system used to register and modify config attributes in ns-3?",
          options: [
            { text: "Object", isCorrect: false },
            { text: "TypeId", isCorrect: true },
            { text: "Ptr", isCorrect: false }
          ],
          feedbackSuccess: "Excellent! TypeId is the foundation of the ns-3 attribute, tracing, and dynamic inheritance system.",
          feedbackError: "Not quite. Object is the base class, and Ptr is the smart pointer template. TypeId registers metadata. Try again!"
        }
      }
    ]
  },
  {
    id: 2,
    title: "Module 2: Compilation & Execution Workflow",
    description: "Configuring the CMake system, using command line arguments, and console logging.",
    lessons: [
      {
        id: "2.1",
        title: "CMake Config & Build System",
        moduleTitle: "Module 2 • Lesson 2.1",
        body: `
          <p>Since version 3.36, ns-3 uses <strong>CMake</strong> as its build system (replacing the old Waf tool). The main entry point for configuring and compiling is the <code>./ns3</code> wrapper script located in the repository root.</p>
          <h4>Typical CLI Build Cycle:</h4>
          <ol>
            <li><strong>Configuration:</strong> Tells CMake which modules, examples, and tests to compile. Run:<br>
                <code>./ns3 configure --enable-examples --enable-tests --build-profile=debug</code>
            </li>
            <li><strong>Compilation:</strong> Compiles changed files and links the library. Run:<br>
                <code>./ns3 build</code>
            </li>
            <li><strong>Execution:</strong> Runs a compiled script from the <code>scratch/</code> directory. Run:<br>
                <code>./ns3 run scratch/aerowlan_exercises/hello-ns3</code>
            </li>
          </ol>
        `,
        practiceFile: null,
        practiceCmd: null
      },
      {
        id: "2.2",
        title: "Command Line Arguments & Parser",
        moduleTitle: "Module 2 • Lesson 2.2",
        body: `
          <p>The <code>CommandLine</code> class enables users to pass arguments directly to a simulation script during execution without recompilation.</p>
          <h4>C++ Setup:</h4>
          <pre><code>int main (int argc, char *argv[])
{
  uint32_t nPackets = 5;
  CommandLine cmd (__FILE__);
  cmd.AddValue ("nPackets", "Number of UDP packets to send", nPackets);
  cmd.Parse (argc, argv);
  ...
}</code></pre>
          <p>You can execute this script from the Linux command line by passing the arguments after a double-dash (<code>--</code>):</p>
          <pre><code>./ns3 run "scratch/my-script --nPackets=10"</code></pre>
        `,
        practiceFile: null,
        practiceCmd: null
      },
      {
        id: "2.3",
        title: "The Logging System (NS_LOG)",
        moduleTitle: "Module 2 • Lesson 2.3",
        body: `
          <p>ns-3 provides a robust, multi-level logging system that can be turned on or filtered at runtime via the <code>NS_LOG</code> environment variable.</p>
          <h4>Logging Components:</h4>
          <p>A logging component is defined in C++ using <code>NS_LOG_COMPONENT_DEFINE ("MyComponent");</code>. Inside the code, logs are printed at various severity levels: <code>NS_LOG_ERROR</code>, <code>NS_LOG_WARN</code>, <code>NS_LOG_INFO</code>, <code>NS_LOG_DEBUG</code>, and <code>NS_LOG_LOGIC</code>.</p>
          <h4>Runtime Filtering:</h4>
          <p>To view logs from the UDP echo client application on your console:</p>
          <pre><code>export NS_LOG="UdpEchoClientApplication=level_all"
./ns3 run scratch/aerowlan_exercises/hello-ns3</code></pre>
        `,
        practiceFile: null,
        practiceCmd: null
      },
      {
        id: "Q2",
        title: "Module 2 Final Quiz",
        isQuizOnly: true,
        moduleTitle: "Module 2 • Assessment",
        quiz: {
          question: "When running a simulation, how are custom script arguments separated from ns-3 built-in configuration arguments?",
          options: [
            { text: "Using a double-dash ( -- )", isCorrect: true },
            { text: "Using a colon ( : )", isCorrect: false },
            { text: "Using the export command", isCorrect: false }
          ],
          feedbackSuccess: "Correct! The double-dash ( -- ) tells the ns3 runner to pass all subsequent arguments directly to the script.",
          feedbackError: "Incorrect. The double-dash ( -- ) is the standard argument separator for the ns3 runner. Try again!"
        }
      }
    ]
  },
  {
    id: 3,
    title: "Module 3: Topology Building & Wired Networks",
    description: "Step-by-step walkthroughs of point-to-point links, shared CSMA networks, and sockets.",
    lessons: [
      {
        id: "3.1",
        title: "Building a Point-to-Point Link (first.cc)",
        moduleTitle: "Module 3 • Lesson 3.1",
        body: `
          <p>The official <code>first.cc</code> simulation sets up a simple link between 2 nodes. Let's trace how this is built step-by-step in C++:</p>
          <ol>
            <li><strong>Create Nodes:</strong> <code>NodeContainer nodes; nodes.Create(2);</code></li>
            <li><strong>Channel Setup:</strong> <code>PointToPointHelper p2p; p2p.SetDeviceAttribute("DataRate", StringValue("5Mbps"));</code></li>
            <li><strong>Install Devices:</strong> <code>NetDeviceContainer devices = p2p.Install(nodes);</code></li>
            <li><strong>Internet Protocol Stack:</strong> <code>InternetStackHelper stack; stack.Install(nodes);</code></li>
            <li><strong>IP Address Assignment:</strong> Assign IP ranges to the devices using <code>Ipv4AddressHelper</code>.</li>
          </ol>
        `,
        practiceFile: "scratch/aerowlan_exercises/p2p-simulation.cc",
        practiceCmd: "./ns3 run scratch/aerowlan_exercises/p2p-simulation",
      },
      {
        id: "3.2",
        title: "Building a CSMA Shared LAN (second.cc)",
        moduleTitle: "Module 3 • Lesson 3.2",
        body: `
          <p>The <code>second.cc</code> script expands on the first by attaching a shared Carrier Sense Multiple Access (CSMA) Local Area Network (LAN) to one of the point-to-point nodes.</p>
          <p>CSMA simulates a shared channel where nodes compete for medium access, modeling collisions and shared bandwidth. We use <code>CsmaHelper</code> to configure data rate and propagation delay and install it on a NodeContainer.</p>
        `,
        practiceFile: "scratch/aerowlan_exercises/csma-simulation.cc",
        practiceCmd: "./ns3 run scratch/aerowlan_exercises/csma-simulation",
      },
      {
        id: "3.3",
        title: "Applications, Sockets, and IP Interfacing",
        moduleTitle: "Module 3 • Lesson 3.3",
        body: `
          <p>Once your physical layers are configured, nodes need to be configured with applications to send data. Sockets are standard networking APIs that handle transport-layer communication (TCP or UDP):</p>
          <ul>
            <li><strong>UdpEchoServerHelper:</strong> Installs a listening UDP server on a target node and port.</li>
            <li><strong>UdpEchoClientHelper:</strong> Installs a client targeting the server's IP address. You configure attributes like <code>MaxPackets</code>, <code>Interval</code>, and <code>PacketSize</code>.</li>
          </ul>
        `,
        practiceFile: null,
        practiceCmd: null
      },
      {
        id: "Q3",
        title: "Module 3 Final Quiz",
        isQuizOnly: true,
        moduleTitle: "Module 3 • Assessment",
        quiz: {
          question: "Which class is used in ns-3 to allocate and bind IPv4 addresses to a NetDeviceContainer?",
          options: [
            { text: "Ipv4AddressHelper", isCorrect: true },
            { text: "InternetStackHelper", isCorrect: false },
            { text: "Ipv4InterfaceContainer", isCorrect: false }
          ],
          feedbackSuccess: "Correct! Ipv4AddressHelper configures the base address and subnet mask, returning an Ipv4InterfaceContainer.",
          feedbackError: "Not quite. InternetStackHelper installs the IP stack, and Ipv4InterfaceContainer holds the output interfaces. Try again!"
        }
      }
    ]
  },
  {
    id: 4,
    title: "Module 4: Wireless Networking & WiFi Stack",
    description: "Detailed walkthrough of the WiFi MAC, physical channel, and QoS EDCA settings.",
    lessons: [
      {
        id: "4.1",
        title: "WiFi Device Stack Architecture",
        moduleTitle: "Module 4 • Lesson 4.1",
        body: `
          <p>The wireless stack is significantly more complex than wired stacks. A <code>WifiNetDevice</code> consists of three layers:</p>
          <ul>
            <li><strong>WifiPhy:</strong> Handles transmission frequency, channel bonding, reception thresholds, and models the physical channel.</li>
            <li><strong>WifiMac:</strong> Manages MAC headers, RTS/CTS handshake, frame aggregation, and EDCA access categories.</li>
            <li><strong>FrameExchangeManager:</strong> Coordinates unicast/broadcast transmission and acknowledgment (ACK) flow.</li>
          </ul>
        `,
        practiceFile: null,
        practiceCmd: null
      },
      {
        id: "4.2",
        title: "Physical Layer & Channel Models",
        moduleTitle: "Module 4 • Lesson 4.2",
        body: `
          <p>In ns-3, wireless channels are modeled using physical layer helpers:</p>
          <ul>
            <li><strong>YansWifiPhy:</strong> Represents standard packets as discrete blocks. Simulates simple path loss (e.g. Friis loss) and delay.</li>
            <li><strong>SpectrumWifiPhy:</strong> A frequency-selective model. It divides the transmission band into subcarriers (essential for modeling modern technologies like OFDMA in 802.11ax/be).</li>
          </ul>
        `,
        practiceFile: "scratch/aerowlan_exercises/simple-wifi.cc",
        practiceCmd: "./ns3 run scratch/aerowlan_exercises/simple-wifi",
      },
      {
        id: "4.3",
        title: "QoS EDCA & Priority Queues",
        moduleTitle: "Module 4 • Lesson 4.3",
        body: `
          <p>Enhanced Distributed Channel Access (EDCA) enables Quality of Service (QoS) in 802.11 networks. It prioritizes frames by placing them in different queues based on their Access Category (AC):</p>
          <ul>
            <li><strong>AC_VO (Voice):</strong> Shortest backoff time, highest priority.</li>
            <li><strong>AC_VI (Video):</strong> Low backoff time.</li>
            <li><strong>AC_BE (Best Effort):</strong> Standard queue.</li>
            <li><strong>AC_BK (Background):</strong> Longest backoff time.</li>
          </ul>
          <p>You map packets to these queues using Socket TOS bits or explicit traffic configurations.</p>
        `,
        practiceFile: null,
        practiceCmd: null
      },
      {
        id: "Q4",
        title: "Module 4 Final Quiz",
        isQuizOnly: true,
        moduleTitle: "Module 4 • Assessment",
        quiz: {
          question: "Which physical layer model is required to simulate frequency-domain subcarrier allocations (OFDMA) in ns-3?",
          options: [
            { text: "YansWifiPhy", isCorrect: false },
            { text: "SpectrumWifiPhy", isCorrect: true }
          ],
          feedbackSuccess: "Correct! SpectrumWifiPhy simulates signals across individual subcarriers, enabling OFDMA and multi-link modelling.",
          feedbackError: "Incorrect. YansWifiPhy is packet-based and cannot model frequency-selective subcarriers. Try again!"
        }
      }
    ]
  },
  {
    id: 5,
    title: "Module 5: WiFi 7 & WiFi 8 Research",
    description: "Configuring WiFi 7 Multi-Link Operation (MLO) and WiFi 8 Coordinated Spatial Reuse.",
    lessons: [
      {
        id: "5.1",
        title: "WiFi 7 Multi-Link Operation (MLO)",
        moduleTitle: "Module 5 • Lesson 5.1",
        body: `
          <p><strong>Multi-Link Operation (MLO)</strong> is a signature feature of WiFi 7 (802.11be / Extremely High Throughput - EHT). Instead of binding a device to a single link, MLO enables Multi-Link Devices (MLDs) to coordinate transmission across multiple links (e.g. 5 GHz and 6 GHz bands) simultaneously.</p>
          <h4>Configuring MLO in ns-3.45:</h4>
          <pre><code>wifi.SetStandard (WIFI_STANDARD_80211be);
wifi.SetMultiLinkType (WifiHelper::DEFAULT_MLD);</code></pre>
          <p>This automatically configures multiple virtual links on the Access Point and Stations, routing traffic dynamically based on channel congestion.</p>
        `,
        practiceFile: "scratch/aerowlan_exercises/wifi7-mlo.cc",
        practiceCmd: "./ns3 run scratch/aerowlan_exercises/wifi7-mlo",
      },
      {
        id: "5.2",
        title: "320 MHz Channel Bonding & 4096-QAM",
        moduleTitle: "Module 5 • Lesson 5.2",
        body: `
          <p>WiFi 7 doubles the maximum channel bandwidth to <strong>320 MHz</strong> (using channel bonding in the 6 GHz band) and introduces **4096-QAM** modulation (via the <code>EhtMcs15</code> rate manager setting).</p>
          <p>This allows devices to achieve multi-gigabit speeds at short range. In ns-3, we configure this by adjusting the <code>ChannelWidth</code> attribute in our physical helper.</p>
        `,
        practiceFile: null,
        practiceCmd: null
      },
      {
        id: "5.3",
        title: "WiFi 8 Coordinated Spatial Reuse (CoSR)",
        moduleTitle: "Module 5 • Lesson 5.3",
        body: `
          <p>IEEE 802.11bn (WiFi 8), currently in the draft/research phase, is focused on **Ultra High Reliability (UHR)**. The primary mechanism to improve throughput at cell boundaries is Multi-AP coordination.</p>
          <h4>Coordinated Spatial Reuse (CoSR):</h4>
          <p>Adjacent Access Points negotiate transmission power levels dynamically. By reducing transmit power during periods of overlapping activity, both APs can transmit to their respective clients simultaneously on the same channel, bypassing standard CCA threshold backoffs.</p>
        `,
        practiceFile: "scratch/aerowlan_exercises/wifi8-cosr.cc",
        practiceCmd: "./ns3 run scratch/aerowlan_exercises/wifi8-cosr",
      },
      {
        id: "Q5",
        title: "Module 5 Final Quiz",
        isQuizOnly: true,
        moduleTitle: "Module 5 • Assessment",
        quiz: {
          question: "Which WiFi 8 candidate technology leverages coordination between overlapping APs to allow parallel transmissions on the same channel by adjusting transmit power?",
          options: [
            { text: "Coordinated Spatial Reuse (CoSR)", isCorrect: true },
            { text: "Coordinated Beamforming (CoBF)", isCorrect: false },
            { text: "Multi-Link Operation (MLO)", isCorrect: false }
          ],
          feedbackSuccess: "Correct! Coordinated Spatial Reuse (CoSR) optimizes transmit power dynamically to enable parallel OBSS transmissions.",
          feedbackError: "Incorrect. CoBF shapes spatial antenna patterns, and MLO is a WiFi 7 single-device multi-band feature. Try again!"
        }
      }
    ]
  }
];

// Current State
let currentModuleIndex = 0;
let currentLessonIndex = 0;
let progress = JSON.parse(localStorage.getItem('tesla_netsim_progress')) || {
  completedLessons: []
};

// Initialize Dashboard & Learning Hub
function init() {
  renderMilestones();
  renderSyllabus();
  loadLesson(currentModuleIndex, currentLessonIndex);
  updateProgressBar();
  lucide.createIcons();
}

// Render Milestones on Dashboard
function renderMilestones() {
  const container = document.getElementById('dashboard-milestones');
  if (!container) return;
  container.innerHTML = '';

  modules.forEach((mod, mIdx) => {
    // Check status
    let statusClass = '';
    let statusIcon = 'lock';
    let statusLabel = 'Locked';

    const isModuleActive = (mIdx === currentModuleIndex);
    const completedCount = mod.lessons.filter(l => progress.completedLessons.includes(l.id)).length;
    const isModuleCompleted = (completedCount === mod.lessons.length);

    if (isModuleCompleted) {
      statusClass = 'completed';
      statusIcon = 'check-circle';
      statusLabel = 'Completed';
    } else if (isModuleActive) {
      statusClass = 'active';
      statusIcon = 'play-circle';
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

// Render Syllabus in Learning Hub
function renderSyllabus() {
  const container = document.getElementById('syllabus-menu');
  if (!container) return;
  container.innerHTML = '';

  modules.forEach((mod, mIdx) => {
    const modHeader = document.createElement('div');
    modHeader.style.fontWeight = 'bold';
    modHeader.style.fontSize = '12px';
    modHeader.style.color = '#e5e7eb';
    modHeader.style.marginTop = mIdx > 0 ? '12px' : '0';
    modHeader.style.marginBottom = '6px';
    modHeader.innerText = `Module ${mod.id}`;
    container.appendChild(modHeader);

    mod.lessons.forEach((les, lIdx) => {
      const item = document.createElement('div');
      const isActive = (mIdx === currentModuleIndex && lIdx === currentLessonIndex);
      const isCompleted = progress.completedLessons.includes(les.id);

      item.className = `syllabus-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
      item.innerHTML = `
        <span>${les.isQuizOnly ? '📝 Quiz: ' + les.title : 'L' + les.id + ': ' + les.title}</span>
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

  const lesson = modules[mIdx].lessons[lIdx];
  
  document.getElementById('lesson-module-tag').innerText = lesson.moduleTitle;
  document.getElementById('lesson-title').innerText = lesson.title;
  
  const bodyElement = document.getElementById('lesson-body');
  const practiceBox = document.getElementById('practice-box');
  const quizBlock = document.getElementById('quiz-block');

  if (lesson.isQuizOnly) {
    bodyElement.innerHTML = `<p>This is the final knowledge check for this module. Answer the question below to verify your understanding and mark the module as completed.</p>`;
    practiceBox.style.display = 'none';
    quizBlock.style.display = 'block';
  } else {
    bodyElement.innerHTML = lesson.body;
    quizBlock.style.display = 'none';
    if (lesson.practiceFile) {
      practiceBox.style.display = 'block';
      document.getElementById('practice-file-path').innerText = lesson.practiceFile;
      document.getElementById('practice-command').innerText = lesson.practiceCmd;
    } else {
      practiceBox.style.display = 'none';
    }
  }

  // Quiz configuration
  const quiz = lesson.quiz;
  if (quiz) {
    document.getElementById('quiz-question').innerText = quiz.question;
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';

    const feedbackContainer = document.getElementById('quiz-feedback');
    feedbackContainer.style.display = 'none';

    quiz.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerText = opt.text;
      btn.onclick = () => submitAnswer(opt, btn, quiz);
      optionsContainer.appendChild(btn);
    });
  }

  // Enable/disable navigation buttons
  document.getElementById('btn-prev-lesson').disabled = (mIdx === 0 && lIdx === 0);
  
  const isLastLesson = (mIdx === modules.length - 1 && lIdx === modules[mIdx].lessons.length - 1);
  document.getElementById('btn-next-lesson').disabled = isLastLesson;
}

// Select a lesson manually from sidebar
function selectLesson(mIdx, lIdx) {
  loadLesson(mIdx, lIdx);
  renderSyllabus();
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
function submitAnswer(option, element, quiz) {
  const feedbackContainer = document.getElementById('quiz-feedback');
  const optionButtons = document.querySelectorAll('.option-btn');

  // Clear previous classes
  optionButtons.forEach(btn => {
    btn.classList.remove('correct', 'wrong');
  });

  if (option.isCorrect) {
    element.classList.add('correct');
    feedbackContainer.className = 'quiz-feedback success';
    feedbackContainer.innerHTML = `<span>✓</span> ${quiz.feedbackSuccess}`;
    feedbackContainer.style.display = 'flex';

    // Mark current lesson as completed
    const lesson = modules[currentModuleIndex].lessons[currentLessonIndex];
    if (!progress.completedLessons.includes(lesson.id)) {
      progress.completedLessons.push(lesson.id);
      localStorage.setItem('tesla_netsim_progress', JSON.stringify(progress));
      updateProgressBar();
      renderMilestones();
      renderSyllabus();
    }
  } else {
    element.classList.add('wrong');
    feedbackContainer.className = 'quiz-feedback error';
    feedbackContainer.innerHTML = `<span>✗</span> ${quiz.feedbackError}`;
    feedbackContainer.style.display = 'flex';
  }
}

// Update progress bar percentage
function updateProgressBar() {
  let totalLessons = 0;
  modules.forEach(m => totalLessons += m.lessons.length);
  const completedCount = progress.completedLessons.length;
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const bar = document.getElementById('overall-progress-bar');
  const text = document.getElementById('overall-progress-text');
  if (bar) bar.style.width = `${pct}%`;
  if (text) text.innerText = `${pct}% Completed`;
}

// Next/Prev Navigation
function prevLesson() {
  if (currentLessonIndex > 0) {
    loadLesson(currentModuleIndex, currentLessonIndex - 1);
  } else if (currentModuleIndex > 0) {
    const prevMod = modules[currentModuleIndex - 1];
    loadLesson(currentModuleIndex - 1, prevMod.lessons.length - 1);
  }
  renderSyllabus();
}

function nextLesson() {
  const currentMod = modules[currentModuleIndex];
  if (currentLessonIndex < currentMod.lessons.length - 1) {
    loadLesson(currentModuleIndex, currentLessonIndex + 1);
  } else if (currentModuleIndex < modules.length - 1) {
    loadLesson(currentModuleIndex + 1, 0);
  }
  renderSyllabus();
}

// Start everything
window.onload = init;
