#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include "ns3/internet-module.h"
#include <iostream>

using namespace ns3;

NS_LOG_COMPONENT_DEFINE ("AeroWlanModule2");

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  // TODO: 1. Create a NodeContainer with 3 nodes (Node 0, Node 1, Node 2)
  

  // TODO: 2. Connect Node 0 to Node 1 via PointToPoint link (Link A) with DataRate "5Mbps" and Delay "2ms"
  

  // TODO: 3. Connect Node 1 to Node 2 via PointToPoint link (Link B) with DataRate "5Mbps" and Delay "2ms"
  

  // TODO: 4. Install InternetStackHelper stack on all nodes
  

  // TODO: 5. Configure IPv4 base subnets and assign addresses:
  // - Link A (Node 0 -> Node 1) uses network "10.1.1.0" with mask "255.255.255.0"
  // - Link B (Node 1 -> Node 2) uses network "10.1.2.0" with mask "255.255.255.0"
  

  // TODO: 6. Populate Global Routing tables: Ipv4GlobalRoutingHelper::PopulateRoutingTables ();
  

  // TODO: 7. Deploy UdpEchoServerHelper server app on Node 2 listening on port 9
  

  // TODO: 8. Deploy UdpEchoClientHelper client app on Node 0 targeting Node 2's IP address (port 9, max packets 1, packet size 54, interval 1s)
  

  // TODO: 9. Configure server to start at 1s, client to start at 2s and stop at 10s.
  

  // TODO: 10. Run and Destroy simulation environment
  

  return 0;
}
