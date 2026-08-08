---
name: wlan-netanim-visualizer
description: >-
  Use this skill to add animation support (NetAnim / NetSim animator) to ns-3 simulation scripts. It enables XML animation trace generation, node positioning, custom node colors, and packet tracing visual animations.
---

# WLAN NetAnim Visualizer Skill

This skill is activated when the user wants to animate their simulation, view node topologies visually, or debug mobility and packet flows using NetAnim.

## NetAnim Integration Guide

1. **Include the NetAnim Module**:
   Ensure that the simulation file includes:
   ```cpp
   #include "ns3/netanim-module.h"
   ```

2. **Configure AnimationInterface**:
   Instantiate `AnimationInterface` before calling `Simulator::Run()`:
   ```cpp
   AnimationInterface anim ("wifi-simulation-anim.xml");
   ```

3. **Node Customization**:
   - **Set Node Descriptions**:
     ```cpp
     anim.UpdateNodeDescription (apNode, "WiFi_AP");
     anim.UpdateNodeDescription (staNode1, "STA_1");
     anim.UpdateNodeDescription (staNode2, "STA_2");
     ```
   - **Set Node Colors** (using RGB values):
     ```cpp
     // Blue color for AP
     anim.UpdateNodeColor (apNode, 0, 0, 255);
     // Green color for STAs
     anim.UpdateNodeColor (staNode1, 0, 255, 0);
     anim.UpdateNodeColor (staNode2, 0, 255, 0);
     ```

4. **Enable Packet Metadata Tracking**:
   To view packet details (such as protocol, size, etc.) in the NetAnim visualizer:
   ```cpp
   anim.EnablePacketMetadata (true);
   ```

5. **Running and Visualizing**:
   - After compiling and running the simulation script, an XML file named `wifi-simulation-anim.xml` will be created in the current directory.
   - Open NetAnim executable (located typically in the `netanim/` build directory or pre-installed) and load the XML file to watch the playback.
