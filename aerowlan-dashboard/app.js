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

// Course Modules Data
const modules = [
  {
    id: 1,
    title: "Module 1: ns-3 Core Basics & Setup",
    description: "Discrete-event simulation mechanics and node-device-channel primitives.",
    lessons: [
      {
        id: "1.1",
        title: "Discrete-Event Simulation & Abstractions",
        moduleTitle: "Module 1 • Lesson 1.1",
        body: `
          <p>Welcome to network simulation in ns-3! Unlike real-time network emulators, ns-3 is a <strong>discrete-event simulator</strong>. Simulation time does not flow continuously; instead, time advances instantly to the timestamp of the next scheduled event in the execution queue.</p>
          <h4>Core Abstractions:</h4>
          <p>Every ns-3 script builds a virtual topology using five essential concepts:</p>
          <ul>
            <li><strong>Node:</strong> The basic computing block (like an empty PC). We add features to it.</li>
            <li><strong>Application:</strong> The software running on the node that generates or consumes traffic (e.g., UdpEchoClient).</li>
            <li><strong>Channel:</strong> The communication medium (wired ethernet cables, coaxial cables, or airwaves/spectrum).</li>
            <li><strong>NetDevice:</strong> The Network Interface Card (NIC). It binds the Node to the Channel so they can transmit and receive.</li>
            <li><strong>Packet:</strong> The raw network message carrying payload and protocol headers.</li>
          </ul>
        `,
        practiceFile: null,
        practiceCmd: null,
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
        id: "1.2",
        title: "Channel Propagation & WifiHelper Setup",
        moduleTitle: "Module 1 • Lesson 1.2",
        body: `
          <p>Before nodes can exchange frames, we must define how signals degrade across space. In ns-3, this is accomplished via two propagation models:</p>
          <ul>
            <li><strong>PropagationLossModel:</strong> Calculates signal attenuation (path loss) due to distance, obstacles, or fading (e.g., <code>FriisPropagationLossModel</code>).</li>
            <li><strong>PropagationDelayModel:</strong> Calculates the speed-of-light delay between Tx and Rx (e.g., <code>ConstantSpeedPropagationDelayModel</code>).</li>
          </ul>
          <h4>Bootstrapping with Helpers:</h4>
          <p>Setting up PHY, MAC, and channel configurations manually takes hundreds of lines of C++. ns-3 uses helper classes like <code>WifiHelper</code> to configure standards (e.g. <code>WIFI_STANDARD_80211be</code> for WiFi 7) and install them automatically.</p>
        `,
        practiceFile: "scratch/aerowlan_exercises/hello-ns3.cc",
        practiceCmd: "./ns3 run scratch/aerowlan_exercises/hello-ns3",
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
      }
    ]
  },
  {
    id: 2,
    title: "Module 2: First C++ Network Script",
    description: "Creating point-to-point links and installing UDP echo client/servers.",
    lessons: [
      {
        id: "2.1",
        title: "Simple Point-to-Point Topology",
        moduleTitle: "Module 2 • Lesson 2.1",
        body: `
          <p>To master the simulation workflow, we first build a simple wired network containing 2 nodes connected via a Point-to-Point channel.</p>
          <h4>Topology Creation Walkthrough:</h4>
          <pre><code>NodeContainer nodes;
nodes.Create (2);

PointToPointHelper pointToPoint;
pointToPoint.SetDeviceAttribute ("DataRate", StringValue ("5Mbps"));
pointToPoint.SetChannelAttribute ("Delay", StringValue ("2ms"));

NetDeviceContainer devices;
devices = pointToPoint.Install (nodes);</code></pre>
          <p>This configures the bandwidth, channel propagation delay, creates the netdevices, and plugs them into the channel.</p>
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
      }
    ]
  },
  {
    id: 3,
    title: "Module 3: Transitioning to WiFi Stack",
    description: "Configuring wireless physical bands, EDCA QoS access, and packet priority.",
    lessons: [
      {
        id: "3.1",
        title: "WiFi PHY & Channel Models",
        moduleTitle: "Module 3 • Lesson 3.1",
        body: `
          <p>ns-3 provides two primary physical layer modules for WiFi:</p>
          <ul>
            <li><strong>YansWifiPhy:</strong> A simpler packet-based model that works well for basic scenarios.</li>
            <li><strong>SpectrumWifiPhy:</strong> A frequency-selective model. It simulates power spectral density (PSD) across distinct subcarriers, which is essential for OFDMA subcarrier allocation and Multi-Link simulations in WiFi 7 and WiFi 8.</li>
          </ul>
          <h4>Frequency Bands:</h4>
          <p>Modern standards utilize 2.4 GHz, 5 GHz, and 6 GHz spectrum bands. We configure these by assigning frequency channels to the physical layer helper.</p>
        `,
        practiceFile: null,
        practiceCmd: null,
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
        id: "3.2",
        title: "QoS & EDCA Configuration",
        moduleTitle: "Module 3 • Lesson 3.2",
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
    title: "Module 4: WiFi 7 & WiFi 8 Research",
    description: "Multi-Link Operation (MLO), 320 MHz channel bonding, and Multi-AP coordination.",
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
        practiceFile: null,
        practiceCmd: null,
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
        title: "WiFi 8 (UHR) Multi-AP Coordination",
        moduleTitle: "Module 4 • Lesson 4.2",
        body: `
          <p>IEEE 802.11bn (WiFi 8), currently in the candidate standard drafting stage, is known as <strong>Ultra High Reliability (UHR)</strong>. The primary research direction focuses on coordination between Access Points (APs) to resolve cell-edge interference.</p>
          <h4>Research Candidates in ns-3:</h4>
          <ul>
            <li><strong>Coordinated Spatial Reuse (CoSR):</strong> Overlapping APs coordinate their transmit power levels dynamically to allow simultaneous transmissions.</li>
            <li><strong>Coordinated Beamforming (CoBF):</strong> APs coordinate their antenna radiation patterns to create nulls in the direction of interfered client devices.</li>
          </ul>
          <p>Researchers use ns-3 to subclass standard EHT models and implement custom coordination schedulers in C++.</p>
        `,
        practiceFile: null,
        practiceCmd: null,
        quiz: {
          question: "Which WiFi 8 candidate feature uses transmit power control to facilitate concurrent transmissions on overlapping cells?",
          options: [
            { text: "Coordinated Spatial Reuse (CoSR)", isCorrect: true },
            { text: "Coordinated Beamforming (CoBF)", isCorrect: false }
          ],
          feedbackSuccess: "Excellent! Coordinated Spatial Reuse adjusts Tx power to minimize interference during simultaneous transmissions.",
          feedbackError: "Incorrect. Coordinated Beamforming shapes radio beams rather than modulating absolute transmit power. Try again!"
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
