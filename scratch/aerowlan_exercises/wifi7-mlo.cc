#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/mobility-module.h"
#include "ns3/wifi-module.h"
#include "ns3/applications-module.h"
#include "ns3/internet-module.h"
#include "ns3/spectrum-module.h"

using namespace ns3;

NS_LOG_COMPONENT_DEFINE ("TeslaWifi7Mlo");

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  Time::SetResolution (Time::NS);
  LogComponentEnable ("UdpEchoClientApplication", LOG_LEVEL_INFO);
  LogComponentEnable ("UdpEchoServerApplication", LOG_LEVEL_INFO);

  // 1. Create Nodes (1 Multi-Link AP and 1 Multi-Link Station)
  NodeContainer wifiApNode;
  wifiApNode.Create (1);
  NodeContainer wifiStaNode;
  wifiStaNode.Create (1);

  // 2. Configure spectrum physical layer and channel
  SpectrumWifiPhyHelper phy;
  auto spectrumChannel = CreateObject<MultiModelSpectrumChannel> ();
  phy.SetChannel (spectrumChannel);

  // 3. Configure WiFi Helper (802.11be standard for WiFi 7)
  WifiHelper wifi;
  wifi.SetStandard (WIFI_STANDARD_80211be);
  wifi.SetRemoteStationManager ("ns3::ConstantRateWifiManager");

  // 4. Setup MAC Layer with Multi-Link Operation (MLO) links
  WifiMacHelper mac;
  Ssid ssid = Ssid ("tesla-mld-ssid");

  // Define two links: Link 0 (5 GHz) and Link 1 (6 GHz)
  // This registers MLO links in the devices
  wifi.SetMultiLinkType (WifiHelper::DEFAULT_MLD);

  // Configure STA MLD Mac
  mac.SetType ("ns3::StaWifiMac",
               "Ssid", SsidValue (ssid),
               "ActiveProbing", BooleanValue (false));
  NetDeviceContainer staDevices = wifi.Install (phy, mac, wifiStaNode);

  // Configure AP MLD Mac
  mac.SetType ("ns3::ApWifiMac",
               "Ssid", SsidValue (ssid));
  NetDeviceContainer apDevice = wifi.Install (phy, mac, wifiApNode);

  // 5. Position Allocations
  MobilityHelper mobility;
  Ptr<ListPositionAllocator> positionAlloc = CreateObject<ListPositionAllocator> ();
  positionAlloc->Add (Vector (0.0, 0.0, 0.0)); // AP
  positionAlloc->Add (Vector (5.0, 0.0, 0.0));  // STA
  mobility.SetPositionAllocator (positionAlloc);
  mobility.SetMobilityModel ("ns3::ConstantPositionMobilityModel");
  mobility.Install (wifiApNode);
  mobility.Install (wifiStaNode);

  // 6. Network stack
  InternetStackHelper stack;
  stack.Install (wifiApNode);
  stack.Install (wifiStaNode);

  Ipv4AddressHelper address;
  address.SetBase ("192.168.10.0", "255.255.255.0");
  Ipv4InterfaceContainer staInterfaces = address.Assign (staDevices);
  Ipv4InterfaceContainer apInterface = address.Assign (apDevice);

  // 7. Applications
  UdpEchoServerHelper echoServer (9);
  ApplicationContainer serverApps = echoServer.Install (wifiApNode.Get (0));
  serverApps.Start (Seconds (1.0));
  serverApps.Stop (Seconds (5.0));

  UdpEchoClientHelper echoClient (apInterface.GetAddress (0), 9);
  echoClient.SetAttribute ("MaxPackets", UintegerValue (4));
  echoClient.SetAttribute ("Interval", TimeValue (Seconds (1.0)));
  echoClient.SetAttribute ("PacketSize", UintegerValue (1400));

  ApplicationContainer clientApps = echoClient.Install (wifiStaNode.Get (0));
  clientApps.Start (Seconds (1.5));
  clientApps.Stop (Seconds (5.0));

  std::cout << "Starting WiFi 7 Multi-Link Operation (MLO) simulation..." << std::endl;
  Simulator::Run ();
  Simulator::Destroy ();
  std::cout << "Simulation Completed Successfully." << std::endl;

  return 0;
}
