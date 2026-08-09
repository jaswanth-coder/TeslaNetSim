#!/bin/bash
# Startup script for Tesla.netsim Dashboard

# Automatically change directory to this script's directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "Launching Tesla.netsim Dashboard Server..."
python3 server.py
