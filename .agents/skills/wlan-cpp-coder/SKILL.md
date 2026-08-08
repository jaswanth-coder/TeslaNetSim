---
name: wlan-cpp-coder
description: >-
  Use this skill to write, modify, debug, and compile C++ code for ns-3 WiFi. This includes simulation scripts, new helper APIs, testing scripts, and modifying the source code of the `wifi` module (e.g., to support WiFi 7 or WiFi 8 prototypes).
---

# WLAN C++ Coder Skill

This skill is activated when the task requires implementing or modifying C++ files in ns-3 (either in `scratch/`, `src/wifi/`, or custom test scripts).

## Guidelines for WiFi C++ Development

1. **Standard Simulation Setup**:
   - Set up nodes and mobility:
     ```cpp
     NodeContainer wifiApNodes;
     wifiApNodes.Create(1);
     NodeContainer wifiStaNodes;
     wifiStaNodes.Create(2);
     
     MobilityHelper mobility;
     mobility.SetPositionAllocator ("ns3::GridPositionAllocator",
                                   "MinX", DoubleValue (0.0),
                                   "MinY", DoubleValue (0.0),
                                   "DeltaX", DoubleValue (5.0),
                                   "DeltaY", DoubleValue (5.0),
                                   "GridWidth", UintegerValue (3),
                                   "LayoutType", StringValue ("RowFirst"));
     mobility.SetMobilityModel ("ns3::ConstantPositionMobilityModel");
     mobility.Install (wifiApNodes);
     mobility.Install (wifiStaNodes);
     ```

2. **WiFi 7 (EHT) Setup**:
   - Configure standard `WIFI_STANDARD_80211be`:
     ```cpp
     WifiHelper wifi;
     wifi.SetStandard (WIFI_STANDARD_80211be);
     ```
   - For Multi-Link Operation (MLO), configure links on AP and STA. Multi-Link Devices (MLDs) use multiple physical bands/channels:
     ```cpp
     // Define links
     wifi.SetMultiLinkType (WifiHelper::DEFAULT_MLD); // or custom link configs
     ```
   - Configure the PHY and Channel Helpers (e.g., using `SpectrumWifiPhyHelper` and `MultiModelSpectrumChannelCreator` for MLO spectrum bands).

3. **Compilation**:
   - Save your simulation files in the `scratch/` folder (e.g., `scratch/wifi-7-simulation.cc`).
   - Run compilation using `./ns3 build` or run the script using `./ns3 run scratch/wifi-7-simulation`.

4. **Debugging and Best Practices**:
   - Use `NS_LOG_COMPONENT_DEFINE` to enable logging inside custom files.
   - Run simulations with log components enabled via `NS_LOG` environment variable:
     `NS_LOG="WifiPhy:WifiMac" ./ns3 run scratch/wifi-7-simulation`
   - Check smart pointer references carefully to avoid cyclic dependencies.
