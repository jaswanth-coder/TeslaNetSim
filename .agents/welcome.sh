#!/usr/bin/env bash
# AeroWLAN Workspace Welcome Banner & Portal Launcher

# Define App Name Placeholder (to be updated once user selects the name)
APP_NAME="AeroWLAN"

cat << "EOF"
================================================================================
     _                       __     ___ _   _ _____                       
    / \   ___ _ __ ___      \ \   / (_) \_( )___ / _ __  _ __   ___       
   / _ \ / _ \ '__/ _ \  ____\ \ / /| |  _  | |_ \| '_ \| '_ \ / __|      
  / ___ \  __/ | | (_) ||_____\ V / | | | | |___) | |_) | | | | (__       
 /_/   \_\___|_|  \___/        \_/  |_|_| |_|____/| .__/|_| |_|\___|      
                                                  |_|                     
     Multi-Agent WLAN & WiFi 7/8 Research Assistant for ns-3.45
================================================================================
EOF

echo -e "[\e[32mSUCCESS\e[0m] Antigravity Customizations loaded successfully!"
echo -e "[\e[34mINFO\e[0m] Checking learning portal status..."

# Check if port 8080 is active (using netstat, ss, or simple python curl test)
PORT_ACTIVE=$(python3 -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_STREAM); s.settimeout(0.5); res = s.connect_ex(('127.0.0.1', 8080)); s.close(); print(res == 0)")

if [ "$PORT_ACTIVE" = "True" ]; then
    echo -e "[\e[34mINFO\e[0m] Learning dashboard is already running."
else
    echo -e "[\e[33mWARNING\e[0m] Starting local server in background on port 8080..."
    python3 -m http.server 8080 --directory aerowlan-dashboard >/dev/null 2>&1 &
    sleep 1
fi

echo -e "[\e[32mSUCCESS\e[0m] Launching web browser dashboard at http://localhost:8080..."
xdg-open http://localhost:8080 >/dev/null 2>&1 || sensible-browser http://localhost:8080 >/dev/null 2>&1 || x-www-browser http://localhost:8080 >/dev/null 2>&1 || echo "Please open http://localhost:8080 in your browser manually."

echo -e "--------------------------------------------------------------------------------"
echo -e "Ready to start Module 1: ns-3 WiFi Architecture & Fundamentals."
