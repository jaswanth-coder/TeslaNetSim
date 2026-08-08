# Module 1 Exercise: Environment Check

This guide helps you compile and run your first ns-3 script to ensure your CMake setup is working correctly.

## Steps

### 1. Compile the hello-ns3 script
Run the CMake-based build system to register and build the new scratch script:
```bash
./ns3 build
```

### 2. Execute the script
Run the compiled executable:
```bash
./ns3 run scratch/aerowlan_exercises/hello-ns3
```

## Expected Output
If compiled successfully, you should see:
```text
========================================
Hello ns-3 WLAN Developer!
AeroWLAN environment check successful.
========================================
```
