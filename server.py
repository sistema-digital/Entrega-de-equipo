import http.server
import socketserver
import webbrowser
import threading
import os
from pathlib import Path

PORT = 8765
ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".json": "application/manifest+json; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".ico": "image/x-icon",
        ".png": "image/png",
    }
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

url = f"http://localhost:{PORT}/index.html"

with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print("")
    print("==============================================")
    print("  ENTREGA DE EQUIPO - PWA")
    print("==============================================")
    print(f"Abriendo: {url}")
    print("No cierres esta ventana mientras uses la app.")
    print("Presiona Ctrl+C para detener el servidor.")
    print("")

    threading.Timer(1.0, lambda: webbrowser.open(url)).start()
    httpd.serve_forever()
