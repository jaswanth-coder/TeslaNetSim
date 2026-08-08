#include "ns3/core-module.h"

using namespace ns3;

NS_LOG_COMPONENT_DEFINE ("AeroWlanHello");

int main (int argc, char *argv[])
{
  CommandLine cmd (__FILE__);
  cmd.Parse (argc, argv);

  Time::SetResolution (Time::NS);

  std::cout << "========================================" << std::endl;
  std::cout << "Hello ns-3 WLAN Developer!" << std::endl;
  std::cout << "AeroWLAN environment check successful." << std::endl;
  std::cout << "========================================" << std::endl;

  return 0;
}
