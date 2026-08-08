---
name: wlan-markdown-documenter
description: >-
  Use this skill to draft documentation, README files, research papers, design
  specifications, and reports for ns-3 WiFi (specifically WiFi 7 and WiFi 8).
---

# WLAN Markdown Documenter Skill

This skill is activated when the task involves writing, structuring, or updating documentation, specs, or explanations related to ns-3 WiFi research.

## Guidelines for WLAN Research Documentation

1. **Clear Specifications**:
   - Always reference IEEE standards (e.g., IEEE 802.11be for WiFi 7, or UHR SG / 802.11bn for WiFi 8).
   - Detail the physical (PHY) and medium access control (MAC) layer changes.
   - Outline the simulation scenario parameters (number of nodes, pathloss model, traffic patterns, channel width, MCS).

2. **ns-3 Specific Documentation**:
   - Link to relevant ns-3 header files (e.g., `wifi-phy.h`, `wifi-mac.h`, `eht-phy.h`).
   - Describe which classes are used and how attributes are set.
   - Show code snippet examples within markdown using `cpp` syntax highlighting.

3. **Academic & Git-Ready Format**:
   - Structure documents with clear headings, lists, tables, and Mermaid diagrams.
   - Provide summary tables of performance metrics (throughput, latency, jitter) and comparison charts.
   - Make the files directly ready to be checked in to GitHub to show to other ns-3 developers.
