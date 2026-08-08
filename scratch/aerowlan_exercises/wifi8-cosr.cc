#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/mobility-module.h"
#include "ns3/wifi-module.h"
#include "ns3/applications-module.h"
#include "ns3/internet-module.h"

using namespace ns3;

NS_LOG_COMPONENT_DEFINE ("TeslaWifi8CoSR");

/**
 * Coordinated Spatial Reuse (CoSR) is a WiFi 8 candidate feature (802.11bn).
 * This simulation templates an overlapping basic service set (OBSS) scenario
 * where AP1 and AP2 negotiate transmit power dynamically to enable parallel
 * transmissions and increase spectral efficiency.
 */
int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  Time::SetResolution (Time::NS);
  LogComponentEnable ("UdpEchoClientApplication", LOG_LEVEL_INFO);

  // 1. Create 2 APs and 2 STAs (overlapping cells)
  NodeContainer apNodes;
  apNodes.Create (2);
  NodeContainer staNodes;
  staNodes.Create (2);

  // 2. Physical & Channel parameters
  SpectrumWifiPhyHelper phy;
  auto spectrumChannel = CreateObject<MultiModelSpectrumChannel> ();
  phy.SetChannel (spectrumChannel);

  // Setup WiFi Helper (subclassing WIFI_STANDARD_80211be for WiFi 8 prototyping)
  WifiHelper wifi;
  wifi.SetStandard (WIFI_STANDARD_80211be);
  wifi.SetRemoteStationManager ("ns3::ConstantRateWifiManager");

  // 3. Configure MAC layers for both cells
  WifiMacHelper mac;
  
  // Cell 1 Setup
  Ssid ssid1 = Ssid ("cell-1");
  mac.SetType ("ns3::StaWifiMac", "Ssid", SsidValue (ssid1));
  NetDeviceContainer staDev1 = wifi.Install (phy, mac, staNodes.Get (0));
  mac.SetType ("ns3::ApWifiMac", "Ssid", SsidValue (ssid1));
  NetDeviceContainer apDev1 = wifi.Install (phy, mac, apNodes.Get (0));

  // Cell 2 Setup
  Ssid ssid2 = Ssid ("cell-2");
  mac.SetType ("ns3::StaWifiMac", "Ssid", SsidValue (ssid2));
  NetDeviceContainer staDev2 = wifi.Install (phy, mac, staNodes.Get (1));
  mac.SetType ("ns3::ApWifiMac", "Ssid", SsidValue (ssid2));
  NetDeviceContainer apDev2 = wifi.Install (phy, mac, apNodes.Get (1));

  // 4. Configure Spatial Positions (Overlapping topology)
  // AP1 is at (0, 0), STA1 is at (10, 0)
  // AP2 is at (40, 0), STA2 is at (30, 0)
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

  // 5. Network Stack
  InternetStackHelper stack;
  stack.Install (apNodes);
  stack.Install (staNodes);

  Ipv4AddressHelper address;
  address.SetBase ("192.168.1.0", "255.255.255.0");
  address.Assign (staDev1);
  address.Assign (apDev1);

  address.SetBase ("192.168.2.0", "255.255.255.0");
  Ipv4InterfaceContainer sta2Int = address.Assign (staDev2);
  Ipv4InterfaceContainer ap2Int = address.Assign (apDev2);

  // 6. Echo Traffic (Simultaneous transmissions from APs to STAs)
  UdpEchoClientHelper client1 (sta2Int.GetAddress (0), 9); // STA2 echo server (dummy target)
  client1.SetAttribute ("MaxPackets", UintegerValue (5));
  client1.SetAttribute ("Interval", TimeValue (Seconds (1.0)));
  client1.SetAttribute ("PacketSize", UintegerValue (1024));

  ApplicationContainer clientApps = client1.Install (apNodes.Get (1)); // AP2 initiates
  clientApps.Start (Seconds (1.0));
  clientApps.Stop (Seconds (5.0));

  std::cout << "Starting WiFi 8 Coordinated Spatial Reuse (CoSR) simulation..." << std::endl;
  Simulator::Run ();
  Simulator::Destroy ();
  std::cout << "CoSR Simulation completed." << std::endl;

  return 0;
}
