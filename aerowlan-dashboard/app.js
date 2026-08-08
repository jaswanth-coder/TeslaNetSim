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

// Course Modules Data - Complete Basic-to-Pro Curriculum
const modules = [
  {
    id: 1,
    title: "Module 1: ns-3 Core Basics & Architecture",
    description: "Discrete-event simulation mechanics and node-device-channel primitives.",
    lessons: [
      {
        id: "1.1",
        title: "Discrete-Event Simulation Mechanics",
        moduleTitle: "Module 1 • Lesson 1.1",
        body: `
          <p>Welcome to network simulation in ns-3! Unlike real-time network emulators, ns-3 is a <strong>discrete-event simulator</strong>. Simulation time does not flow continuously; instead, time advances instantly to the timestamp of the next scheduled event in the execution queue.</p>
          <h4>Simulation Mechanics:</h4>
          <p>An ns-3 simulation runs inside a single thread. It operates by maintaining a queue of events ordered by their scheduled execution time. When an event fires, the simulator shifts its virtual clock to that event's execution time, executes the callback function, and registers any new events scheduled during execution.</p>
          <p>This flow is initialized via <code>Simulator::Run()</code> and memory resources are cleaned up using <code>Simulator::Destroy()</code> at the end of the script.</p>
        `,
        practiceFile: null,
        practiceCmd: null,
        quiz: {
          question: "Which method is called at the end of every ns-3 simulation to free memory resources?",
          options: [
            { text: "Simulator::Stop()", isCorrect: false },
            { text: "Simulator::Destroy()", isCorrect: true },
            { text: "Simulator::Clean()", isCorrect: false }
          ],
          feedbackSuccess: "Correct! Simulator::Destroy() is vital for freeing smart pointer handles and cleaning allocated memory.",
          feedbackError: "Incorrect. Simulator::Stop() stops the execution loop, but Simulator::Destroy() is required to free memory. Try again!"
        }
      },
      {
        id: "1.2",
        title: "Core Network Abstractions",
        moduleTitle: "Module 1 • Lesson 1.2",
        body: `
          <p>Every network topology in ns-3 is built using five essential concepts:</p>
          <ul>
            <li><strong>Node:</strong> Represented by the <code>Node</code> class. This is a blank computer or device. It has no networking capability until components are installed.</li>
            <li><strong>NetDevice:</strong> Represented by <code>NetDevice</code> subclasses (e.g. <code>WifiNetDevice</code>). Acts as the Network Interface Card (NIC) binding the Node to the Channel.</li>
            <li><strong>Channel:</strong> Represented by <code>Channel</code> subclasses. Models the physical transmission medium (e.g., a wired cable or airwaves).</li>
            <li><strong>Application:</strong> The traffic generator or consumer (e.g., UDP Client/Server) running on the Node.</li>
            <li><strong>Packet:</strong> The raw network message carrying headers and payload traversing the channel.</li>
          </ul>
        `,
        practiceFile: "scratch/aerowlan_exercises/hello-ns3.cc",
        practiceCmd: "./ns3 run scratch/aerowlan_exercises/hello-ns3",
        quiz: {
          question: "Which component represents the Network Interface Card (NIC) in ns-3?",
          options: [
            { text: "Node", isCorrect: false },
            { text: "NetDevice", isCorrect: true },
            { text: "Channel", isCorrect: false }
          ],
          feedbackSuccess: "Correct! The NetDevice acts as the NIC, binding the Node's software to the physical Channel.",
          feedbackError: "Incorrect. The Node is the device itself, while the Channel is the transmission medium. Try again!"
        }
      },
      {
        id: "1.3",
        title: "The Object Model & Attribute System",
        moduleTitle: "Module 1 • Lesson 1.3",
        body: `
          <p>ns-3 utilizes a unified Object System to manage class lifetimes, runtime type registration, and parameter configuration.</p>
          <h4>Key Pillars:</h4>
          <ul>
            <li><strong>Smart Pointers:</strong> Managed via <code>Ptr&lt;Object&gt;</code>, which implements reference-counting garbage collection.</li>
            <li><strong>TypeId:</strong> Registers class names, parent classes, and configuration attributes in the ns-3 Config subsystem.</li>
            <li><strong>Attribute System:</strong> Allows developers to configure object variables (e.g. <code>DataRate</code> or <code>Delay</code>) using string values, numbers, or boolean values without recompiling.</li>
          </ul>
          <p>Example: <code>pointToPoint.SetDeviceAttribute ("DataRate", StringValue ("5Mbps"));</code></p>
        `,
        practiceFile: null,
        practiceCmd: null,
        quiz: {
          question: "What class registers attributes, type names, and class hierarchies in the ns-3 config system?",
          options: [
            { text: "Object", isCorrect: false },
            { text: "TypeId", isCorrect: true },
            { text: "AttributeValue", isCorrect: false }
          ],
          feedbackSuccess: "Perfect! TypeId provides runtime type information (RTTI) and exposes attributes to the configuration path.",
          feedbackError: "Incorrect. Object is the base class, and AttributeValue is the base for attribute data types. Try again!"
        }
      }
    ]
  },
  {
    id: 2,
    title: "Module 2: First Network Simulation",
    description: "Creating point-to-point links and CSMA shared networks.",
    lessons: [
      {
        id: "2.1",
        title: "Simple Point-to-Point Topology",
        moduleTitle: "Module 2 • Lesson 2.1",
        body: `
          <p>Let's build a simple wired network containing 2 nodes connected via a Point-to-Point channel.</p>
          <h4>Topology Creation Walkthrough:</h4>
          <pre><code>NodeContainer nodes;
nodes.Create (2);

PointToPointHelper pointToPoint;
pointToPoint.SetDeviceAttribute ("DataRate", StringValue ("5Mbps"));
pointToPoint.SetChannelAttribute ("Delay", StringValue ("2ms"));

NetDeviceContainer devices;
devices = pointToPoint.Install (nodes);</code></pre>
          <p>This configures the link bandwidth, propagation delay, instantiates the netdevices, and connects them via a channel helper.</p>
        `,
        practiceFile: "scratch/aerowlan_exercises/p2p-simulation.cc",
        practiceCmd: "./ns3 run scratch/aerowlan_exercises/p2p-simulation",
        quiz: {
          question: "What helper class did we use to configure the point-to-point link properties?",
          options: [
            { text: "CsmaHelper", isCorrect: false },
            { text: "PointToPointHelper", isCorrect: true },
            { text: "WifiHelper", isCorrect: false }
          ],
          feedbackSuccess: "Correct! PointToPointHelper manages point-to-point topology configurations.",
          feedbackError: "Try again. CsmaHelper is for shared Ethernet channels, and WifiHelper is for wireless channels."
        }
      },
      {
        id: "2.2",
        title: "CSMA Shared Media & Bus Topology",
        moduleTitle: "Module 2 • Lesson 2.2",
        body: `
          <p>Unlike Point-to-Point links, CSMA (Carrier Sense Multiple Access) models a shared Ethernet bus where multiple nodes compete for transmission medium access.</p>
          <h4>CSMA Setup:</h4>
          <pre><code>NodeContainer csmaNodes;
csmaNodes.Create (4);

CsmaHelper csma;
csma.SetChannelAttribute ("DataRate", StringValue ("100Mbps"));
csma.SetChannelAttribute ("Delay", TimeValue (NanoSeconds (6560)));

NetDeviceContainer csmaDevices = csma.Install (csmaNodes);</code></pre>
          <p>This links all 4 nodes to a single shared bus, simulating collision domains and shared bandwidth.</p>
        `,
        practiceFile: "scratch/aerowlan_exercises/csma-simulation.cc",
        practiceCmd: "./ns3 run scratch/aerowlan_exercises/csma-simulation",
        quiz: {
          question: "Which network topology does CSMA model in ns-3?",
          options: [
            { text: "Ring Topology", isCorrect: false },
            { text: "Star Topology", isCorrect: false },
            { text: "Bus/Shared Channel Topology", isCorrect: true }
          ],
          feedbackSuccess: "Correct! CSMA simulates a multi-point bus network where collision events can occur.",
          feedbackError: "Incorrect. CSMA models a bus topology where all nodes are connected to a shared transmission line."
        }
      }
    ]
  },
  {
    id: 3,
    title: "Module 3: Transitioning to the WiFi Stack",
    description: "Configuring wireless physical bands, EDCA QoS access, and packet priority.",
    lessons: [
      {
        id: "3.1",
        title: "WiFi Device Stack Architecture",
        moduleTitle: "Module 3 • Lesson 3.1",
        body: `
          <p>The ns-3 WiFi module models the IEEE 802.11 standards stack. It is structured into multiple layers inside the <code>WifiNetDevice</code>:</p>
          <ul>
            <li><strong>WifiPhy:</strong> Simulates signal transmission, reception, and interference over spectrum bands.</li>
            <li><strong>WifiMac:</strong> Handles link access protocols, frames association/disassociation, and management structures.</li>
            <li><strong>FrameExchangeManager:</strong> Manages control frames, RTS/CTS negotiations, and frame acknowledgment sequences.</li>
          </ul>
          <p>These layers are set up using <code>WifiHelper</code>, which manages standards settings and binds the PHY and MAC modules together.</p>
        `,
        practiceFile: null,
        practiceCmd: null,
        quiz: {
          question: "Which helper class is used to configure WiFi standard parameters and bind PHY and MAC helpers to nodes?",
          options: [
            { text: "WifiHelper", isCorrect: true },
            { text: "MobilityHelper", isCorrect: false },
            { text: "InternetStackHelper", isCorrect: false }
          ],
          feedbackSuccess: "Spot on! WifiHelper acts as the central coordinator to install the wireless stack onto NodeContainers.",
          feedbackError: "Not quite. MobilityHelper configures node positions, and InternetStackHelper installs the IP stack. Try again!"
        }
      },
      {
        id: "3.2",
        title: "PHY Layer & Channel Models",
        moduleTitle: "Module 3 • Lesson 3.2",
        body: `
          <p>ns-3 provides two primary physical layer modules for WiFi:</p>
          <ul>
            <li><strong>YansWifiPhy:</strong> A simpler packet-based model that works well for basic scenarios.</li>
            <li><strong>SpectrumWifiPhy:</strong> A frequency-selective model. It simulates power spectral density (PSD) across distinct subcarriers, which is essential for OFDMA subcarrier allocation and Multi-Link simulations in WiFi 7 and WiFi 8.</li>
          </ul>
          <h4>Frequency Bands:</h4>
          <p>Modern standards utilize 2.4 GHz, 5 GHz, and 6 GHz spectrum bands. We configure these by assigning frequency channels to the physical layer helper.</p>
        `,
        practiceFile: "scratch/aerowlan_exercises/simple-wifi.cc",
        practiceCmd: "./ns3 run scratch/aerowlan_exercises/simple-wifi",
        quiz: {
          question: "Which PHY helper is recommended for simulating OFDMA frequency subcarrier allocations?",
          options: [
            { text: "YansWifiPhyHelper", isCorrect: false },
            { text: "SpectrumWifiPhyHelper", isCorrect: true }
          ],
          feedbackSuccess: "Correct! SpectrumWifiPhy is required for precise frequency-domain (OFDMA) modeling.",
          feedbackError: "Incorrect. YansWifiPhy does not model fine-grained subcarrier allocations. Try again!"
        }
      },
      {
        id: "3.3",
        title: "QoS & EDCA Configuration",
        moduleTitle: "Module 3 • Lesson 3.3",
        body: `
          <p>Quality of Service (QoS) in 802.11 is governed by Enhanced Distributed Channel Access (EDCA). It defines four Access Categories (AC) to prioritize high-value traffic:</p>
          <ol>
            <li><strong>AC_VO (Voice):</strong> Highest priority, minimal delay.</li>
            <li><strong>AC_VI (Video):</strong> High priority, low delay.</li>
            <li><strong>AC_BE (Best Effort):</strong> Standard priority for web browsing.</li>
            <li><strong>AC_BK (Background):</strong> Lowest priority, for bulk downloads.</li>
          </ol>
          <p>In ns-3, you map applications to these categories using socket TOS bits or Traffic Specification (TSPEC) parameters.</p>
        `,
        practiceFile: null,
        practiceCmd: null,
        quiz: {
          question: "Which Access Category has the absolute highest priority in EDCA medium access?",
          options: [
            { text: "AC_BE", isCorrect: false },
            { text: "AC_VI", isCorrect: false },
            { text: "AC_VO", isCorrect: true }
          ],
          feedbackSuccess: "Perfect! AC_VO (Voice) gets priority access to reduce jitter and delay for voice streams.",
          feedbackError: "Incorrect. AC_BE is best-effort and AC_VI is video. Voice (AC_VO) is higher. Try again!"
        }
      }
    ]
  },
  {
    id: 4,
    title: "Module 4: WiFi 7 (802.11be - Extremely High Throughput)",
    description: "Multi-Link Operation (MLO), 320 MHz channel bonding, and Multi-RU.",
    lessons: [
      {
        id: "4.1",
        title: "WiFi 7 Multi-Link Operation (MLO)",
        moduleTitle: "Module 4 • Lesson 4.1",
        body: `
          <p><strong>Multi-Link Operation (MLO)</strong> is a signature feature of IEEE 802.11be (WiFi 7). Instead of negotiating traffic on a single frequency band, a Multi-Link Device (MLD) can bind multiple links (e.g. 5 GHz and 6 GHz links) simultaneously.</p>
          <h4>Benefits of MLO:</h4>
          <ul>
            <li><strong>Link Steering & Aggregation:</strong> Send packets concurrently on both links or shift traffic to the idle channel.</li>
            <li><strong>Low Latency:</strong> Drastically reduces queuing delays by bypassing channel congestion on individual bands.</li>
          </ul>
          <p>In ns-3.45, MLO is enabled by configuring multi-link devices using the <code>EhtFrameExchangeManager</code> and defining links on the <code>WifiHelper</code>.</p>
        `,
        practiceFile: "scratch/aerowlan_exercises/wifi7-mlo.cc",
        practiceCmd: "./ns3 run scratch/aerowlan_exercises/wifi7-mlo",
        quiz: {
          question: "What does MLO stand for in IEEE 802.11be (WiFi 7) specifications?",
          options: [
            { text: "Multi-Lane Optimization", isCorrect: false },
            { text: "Multi-Link Operation", isCorrect: true },
            { text: "Modulation Level Output", isCorrect: false }
          ],
          feedbackSuccess: "Correct! Multi-Link Operation allows simultaneous transmission across distinct frequencies.",
          feedbackError: "Incorrect. MLO stands for Multi-Link Operation. Try again!"
        }
      },
      {
        id: "4.2",
        title: "320 MHz Channels & 4096-QAM",
        moduleTitle: "Module 4 • Lesson 4.2",
        body: `
          <p>WiFi 7 doubles the maximum channel bandwidth compared to WiFi 6, enabling channel widths of up to <strong>320 MHz</strong> in the 6 GHz band.</p>
          <p>Additionally, it introduces **4096-QAM** modulation (up from 1024-QAM in WiFi 6). This allows each symbol to carry 12 bits instead of 10, increasing raw physical throughput by 20% under clean channel conditions.</p>
          <p>In ns-3.45, configure this by setting the <code>ChannelWidth</code> attribute in ` + "`SpectrumWifiPhyHelper`" + ` and setting the MCS to 15 (e.g. <code>EhtMcs15</code>).</p>
        `,
        practiceFile: null,
        practiceCmd: null,
        quiz: {
          question: "What is the maximum channel bandwidth supported in 802.11be (WiFi 7)?",
          options: [
            { text: "80 MHz", isCorrect: false },
            { text: "160 MHz", isCorrect: false },
            { text: "320 MHz", isCorrect: true }
          ],
          feedbackSuccess: "Correct! WiFi 7 supports up to 320 MHz channels to deliver multi-gigabit throughput.",
          feedbackError: "Incorrect. 160 MHz was the limit for WiFi 6. WiFi 7 extends this to 320 MHz."
        }
      }
    ]
  },
  {
    id: 5,
    title: "Module 5: WiFi 8 (802.11bn - Ultra High Reliability)",
    description: "Overlapping Basic Service Set (OBSS) coordination, power control, and beamforming.",
    lessons: [
      {
        id: "5.1",
        title: "Multi-AP Spatial Reuse (CoSR)",
        moduleTitle: "Module 5 • Lesson 5.1",
        body: `
          <p>IEEE 802.11bn (WiFi 8), currently in the candidate standard drafting stage, is known as <strong>Ultra High Reliability (UHR)</strong>. The primary research direction focuses on coordination between Access Points (APs) to resolve cell-edge interference.</p>
          <h4>Coordinated Spatial Reuse (CoSR):</h4>
          <p>In traditional WLANs, overlapping basic service sets (OBSS) must back off and wait when they sense an active transmission from a neighboring cell (CCA threshold block).</p>
          <p>Under CoSR, adjacent APs exchange control messages to dynamically adjust their transmission power levels. This reduces co-channel interference enough to allow parallel, simultaneous transmissions on the same channel, significantly boosting spatial capacity.</p>
        `,
        practiceFile: "scratch/aerowlan_exercises/wifi8-cosr.cc",
        practiceCmd: "./ns3 run scratch/aerowlan_exercises/wifi8-cosr",
        quiz: {
          question: "Which WiFi 8 candidate feature uses transmit power control to facilitate concurrent transmissions on overlapping cells?",
          options: [
            { text: "Coordinated Spatial Reuse (CoSR)", isCorrect: true },
            { text: "Coordinated Beamforming (CoBF)", isCorrect: false }
          ],
          feedbackSuccess: "Excellent! Coordinated Spatial Reuse adjusts Tx power to minimize interference during simultaneous transmissions.",
          feedbackError: "Incorrect. Coordinated Beamforming shapes radio beams rather than modulating absolute transmit power. Try again!"
        }
      },
      {
        id: "5.2",
        title: "Coordinated Beamforming & OFDMA",
        moduleTitle: "Module 5 • Lesson 5.2",
        body: `
          <p>Beyond spatial reuse, WiFi 8 candidate features include more complex physical-layer AP coordination models:</p>
          <ul>
            <li><strong>Coordinated Beamforming (CoBF):</strong> Multiple APs share channel state information (CSI) and coordinate their multi-antenna precoding matrices. By shaping their radiation beams, AP 1 can place a spatial "null" (zero energy) at the position of AP 2's station, allowing both cells to transmit simultaneously without interfering.</li>
            <li><strong>Coordinated OFDMA (Co-OFDMA):</strong> APs divide the available frequency spectrum into orthogonal Resource Units (RUs) and assign them to stations in different cells, avoiding packet collisions entirely.</li>
          </ul>
        `,
        practiceFile: null,
        practiceCmd: null,
        quiz: {
          question: "Coordinated Beamforming (CoBF) primarily controls what physical characteristic to reduce OBSS interference?",
          options: [
            { text: "Channel bandwidth", isCorrect: false },
            { text: "Antenna radiation patterns and spatial nulls", isCorrect: true },
            { text: "Carrier frequency", isCorrect: false }
          ],
          feedbackSuccess: "Perfect! CoBF controls antenna phase and amplitude to steer energy away from neighboring stations.",
          feedbackError: "Incorrect. CoBF manipulates spatial properties of antenna beam patterns to minimize cross-talk."
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
        <span>L${les.id}: ${les.title}</span>
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
  document.getElementById('lesson-body').innerHTML = lesson.body;

  // Practice box configuration
  const practiceBox = document.getElementById('practice-box');
  if (lesson.practiceFile) {
    practiceBox.style.display = 'block';
    document.getElementById('practice-file-path').innerText = lesson.practiceFile;
    document.getElementById('practice-command').innerText = lesson.practiceCmd;
  } else {
    practiceBox.style.display = 'none';
  }

  // Quiz configuration
  const quiz = lesson.quiz;
  document.getElementById('quiz-question').innerText = quiz.question;
  const optionsContainer = document.getElementById('quiz-options');
  optionsContainer.innerHTML = '';

  const feedbackContainer = document.getElementById('quiz-feedback');
  feedbackContainer.style.display = 'none';

  quiz.options.forEach((opt, oIdx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = opt.text;
    btn.onclick = () => submitAnswer(opt, btn, quiz);
    optionsContainer.appendChild(btn);
  });

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
