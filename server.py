import http.server
import json
import os
import sys
import subprocess
import re

PORT = 8000
DIRECTORY = "aerowlan-dashboard"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_POST(self):
        if self.path == '/api/submit':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                problem_id = data.get('problem_id')
                code = data.get('code')
                
                if not problem_id or not code:
                    raise ValueError("problem_id and code are required fields")
                
                # Create a submissions directory in scratch/aerowlan_exercises
                project_root = os.path.abspath(os.path.dirname(__file__))
                submissions_dir = os.path.join(project_root, 'scratch', 'aerowlan_exercises', 'submissions')
                os.makedirs(submissions_dir, exist_ok=True)
                
                filepath = os.path.join(submissions_dir, f"{problem_id}.cc")
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(code)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                # Step 1: Run ns-3 build
                print(f"Compiling submission for {problem_id}...")
                build_cmd = ["./ns3", "build"]
                build_res = subprocess.run(build_cmd, capture_output=True, text=True, cwd=project_root, timeout=45)
                
                if build_res.returncode != 0:
                    error_msg = build_res.stderr if build_res.stderr.strip() else build_res.stdout
                    response = {
                        'status': 'compile_error',
                        'message': 'Compilation failed.',
                        'output': error_msg
                    }
                    self.wfile.write(json.dumps(response).encode('utf-8'))
                    return

                # Step 2: Run simulation
                print(f"Running simulation for {problem_id}...")
                # The target name is prefix-based: scratch_aerowlan_exercises_submissions_problem_id
                target_path = f"scratch/aerowlan_exercises/submissions/{problem_id}"
                run_cmd = ["./ns3", "run", target_path]
                run_res = subprocess.run(run_cmd, capture_output=True, text=True, cwd=project_root, timeout=15)
                
                if run_res.returncode != 0:
                    response = {
                        'status': 'runtime_error',
                        'message': 'Simulation run failed.',
                        'output': run_res.stderr or run_res.stdout
                    }
                    self.wfile.write(json.dumps(response).encode('utf-8'))
                    return

                # Success!
                response = {
                    'status': 'success',
                    'message': 'Compilation and execution successful!',
                    'output': run_res.stdout
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
            except subprocess.TimeoutExpired as te:
                response = {
                    'status': 'timeout_error',
                    'message': 'Execution timed out (Limit reached). Check for infinite loops.',
                    'output': str(te)
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
            except Exception as e:
                response = {'status': 'error', 'message': str(e)}
                self.wfile.write(json.dumps(response).encode('utf-8'))
        elif self.path == '/api/multiagent/analyze':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                class_name = data.get('class_name')
                if not class_name:
                    raise ValueError("class_name is a required field")
                
                analysis = self.analyze_cpp_class(class_name)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(analysis).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def analyze_cpp_class(self, class_name):
        clean_name = class_name.replace("ns3::", "")
        header_file = None
        class_pattern = re.compile(r'\bclass\s+' + re.escape(clean_name) + r'\b[^;]*\{')
        
        project_root = os.path.abspath(os.path.dirname(__file__))
        src_wifi_dir = os.path.join(project_root, 'src', 'wifi')

        for root, dirs, files in os.walk(src_wifi_dir):
            for file in files:
                if file.endswith(".h"):
                    filepath = os.path.join(root, file)
                    try:
                        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                            if class_pattern.search(content):
                                header_file = filepath
                                break
                    except Exception:
                        pass
            if header_file:
                break

        if not header_file:
            return {"error": f"Class {class_name} not found"}

        cc_file = header_file.replace(".h", ".cc")
        if not os.path.exists(cc_file):
            return {"error": f"Source file {cc_file} not found"}

        try:
            with open(cc_file, "r", encoding="utf-8", errors="ignore") as f:
                cc_content = f.read()
        except Exception as e:
            return {"error": f"Failed to read source file: {str(e)}"}

        attributes = []
        attr_matches = re.finditer(r'\.AddAttribute\s*\(\s*"([^"]+)"', cc_content)
        for match in attr_matches:
            attr_name = match.group(1)
            start_pos = match.end()
            desc_matches = re.findall(r'"([^"]*)"', cc_content[start_pos:start_pos+1000])
            desc = desc_matches[0] if desc_matches else ""
            attributes.append({
                "name": attr_name,
                "description": desc.strip()
            })

        trace_sources = []
        trace_matches = re.finditer(r'\.AddTraceSource\s*\(\s*"([^"]+)"', cc_content)
        for match in trace_matches:
            trace_name = match.group(1)
            start_pos = match.end()
            desc_matches = re.findall(r'"([^"]*)"', cc_content[start_pos:start_pos+1000])
            desc = desc_matches[0] if desc_matches else ""
            trace_sources.append({
                "name": trace_name,
                "description": desc.strip()
            })

        rel_header = os.path.relpath(header_file, project_root)
        rel_cc = os.path.relpath(cc_file, project_root)

        return {
            "class": class_name,
            "header": rel_header,
            "cc": rel_cc,
            "attributes": attributes,
            "trace_sources": trace_sources
        }


    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    # Change working directory to the project root where this script resides
    os.chdir(os.path.abspath(os.path.dirname(__file__)))
    server_address = ('', PORT)
    
    try:
        httpd = http.server.HTTPServer(server_address, CustomHandler)
        print(f"==================================================")
        print(f"Tesla.netsim Local Learning Dashboard Backend")
        print(f"Running on http://localhost:{PORT}")
        print(f"==================================================")
        print(f"Serving files from: {os.path.abspath(DIRECTORY)}")
        print(f"Submissions will be saved in: scratch/aerowlan_exercises/submissions/")
        print(f"Press Ctrl+C to stop the server.")
        
        # Open in browser
        import webbrowser
        webbrowser.open(f"http://localhost:{PORT}")
        
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Tesla.netsim server...")
        sys.exit(0)
    except Exception as e:
        print(f"Failed to start server: {e}")
        sys.exit(1)
