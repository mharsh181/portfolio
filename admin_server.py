#!/usr/bin/env python3
"""
Portfolio Admin Server
Lightweight, zero-dependency Python server to host the portfolio and support
direct disk persistence for the Admin Panel.

Usage:
    python admin_server.py [port]
Example:
    python admin_server.py 8000
"""

import http.server
import socketserver
import json
import os
import sys
import shutil

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'portfolio-data.json')

class AdminHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS for local testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/data':
            if os.path.exists(DATA_FILE):
                try:
                    with open(DATA_FILE, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    content = json.dumps(data, indent=2, ensure_ascii=False).encode('utf-8')
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.send_header('Content-Length', str(len(content)))
                    self.end_headers()
                    self.wfile.write(content)
                    return
                except Exception as e:
                    self.send_error(500, f"Error reading data: {str(e)}")
                    return
            else:
                self.send_error(404, "Data file not found")
                return
        
        super().do_GET()

    def do_POST(self):
        if self.path == '/api/save':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length <= 0:
                    self.send_error(400, "Empty payload")
                    return
                
                body = self.rfile.read(content_length).decode('utf-8')
                new_data = json.loads(body)

                # Create backup if file exists
                if os.path.exists(DATA_FILE):
                    shutil.copy2(DATA_FILE, DATA_FILE + '.bak')

                # Write formatted JSON
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    json.dump(new_data, f, indent=2, ensure_ascii=False)

                response_content = json.dumps({
                    "status": "success",
                    "message": "Data successfully written to portfolio-data.json on disk!"
                }).encode('utf-8')

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(response_content)))
                self.end_headers()
                self.wfile.write(response_content)
                print(f"[Admin Server] portfolio-data.json updated successfully.")
                return
            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON body")
                return
            except Exception as e:
                self.send_error(500, f"Save failed: {str(e)}")
                return
        
        self.send_error(404, "Endpoint not found")

def run():
    # Ensure current directory is the script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), AdminHandler) as httpd:
        print("=" * 65)
        print("[SERVER] Portfolio & Admin Server is running!")
        print(f" -> Portfolio:   http://localhost:{PORT}")
        print(f" -> Admin Panel: http://localhost:{PORT}/admin.html")
        print(f" -> Serving Dir: {script_dir}")
        print("=" * 65)
        print("Press Ctrl+C to stop the server.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == '__main__':
    run()
