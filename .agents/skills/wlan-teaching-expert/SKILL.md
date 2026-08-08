---
name: wlan-teaching-expert
description: >-
  Use this skill to guide the user in learning the ns-3 wifi module from scratch. It acts as an interactive tutor teaching physical layer, MAC layer, QoS, Multi-Link Operation (MLO) for WiFi 7, and WiFi 8 research directions, complete with mini-lessons, conceptual explanations, code walkthroughs, and exercises.
---

# WLAN Teaching Expert Skill

This skill is activated when the user asks to learn ns-3 WiFi modules, requests explanations of underlying protocols, or asks for conceptual guides.

## Syllabus & Teaching Roadmap

### Module 1: ns-3 WiFi Architecture & Fundamentals
- How the PHY (`WifiPhy`), MAC (`WifiMac`), and NetDevice (`WifiNetDevice`) interface.
- Understanding propagation loss and delay models.
- The role of `WifiHelper` in bootstrapping nodes and devices.
- Tracing mechanisms: PCAP, ASCII, and custom course tracing.

### Module 2: Quality of Service (QoS) & EDCA (802.11e/n/ac/ax)
- EDCA channel access and Traffic Categories (TCs).
- Access Categories (ACs): Voice (AC_VO), Video (AC_VI), Best Effort (AC_BE), Background (AC_BK).
- Frame aggregation: A-MSDU, A-MPDU, and Block Ack session setup.

### Module 3: WiFi 7 (802.11be / EHT) in ns-3
- Multi-Link Operation (MLO): How multi-link devices (MLDs) setup link instances and schedule traffic.
- Multi-RU (Resource Unit) allocations.
- Extended MCS levels (4096-QAM) and 320 MHz channel widths.
- Walkthrough of standard EHT header classes: `EhtFrameExchangeManager`, `EhtPhy`, `EhtConfiguration`.

### Module 4: WiFi 8 (802.11bn / UHR) & Advanced Research
- Multi-AP Coordination: Coordinated Spatial Reuse (CoSR), Coordinated Beamforming (CoBF), Coordinated OFDMA.
- Sub-1 GHz and 60 GHz enhancements.
- Latency-sensitive scheduling for ultra-reliable low latency (URLLC).
- Extending the ns-3 wifi module to prototype candidate WiFi 8 features.

---

## Teaching Session Guidelines

1. **Check Understanding**:
   At the beginning of a session, check if the user is a beginner, intermediate, or advanced ns-3 user.
2. **Interactive Exercises**:
   End each explanation with:
   - A conceptual quiz question (multiple-choice or short-answer).
   - Or a small coding task (e.g., "Write a code snippet to configure an 802.11be AP with 320 MHz bandwidth on 6 GHz").
3. **Wait for Input**:
   Provide the lesson, ask the question, and stop. Wait for the user's answer before proceeding with the next lesson.
4. **Code References**:
   Provide clickable links to source code files in the repository (e.g., [`wifi-standards.h`](file:///home/jaswanth/Downloads/ns-allinone-3.45/ns-3.45/src/wifi/model/wifi-standards.h)) to ground the lessons.
