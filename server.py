#!/usr/bin/env python3
"""
Servidor HTTP personalizado que deshabilita caché para desarrollo.
Esto evita problemas de caché del navegador cuando haces cambios en el sitio.
"""

import http.server
import socketserver
import os
import sys
from datetime import datetime
import urllib.request
import urllib.error

API_BASE = "https://koten-api.ozkr.net"

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler HTTP que añade headers para deshabilitar caché."""

    def do_GET(self):
        if self.path == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return

        if self.path.startswith('/word/') or self.path.startswith('/image/'):
            self._proxy_get()
            return

        super().do_GET()

    def _proxy_get(self):
        upstream_url = f"{API_BASE}{self.path}"
        request = urllib.request.Request(
            upstream_url,
            method='GET',
            headers={
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            },
        )

        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                payload = response.read()
                self.send_response(response.status)

                content_type = response.headers.get('Content-Type', 'application/octet-stream')
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
        except urllib.error.HTTPError as error:
            self.send_error(error.code, error.reason)
        except urllib.error.URLError as error:
            self.send_error(502, f'No se pudo conectar al upstream: {error.reason}')
    
    def end_headers(self):
        # Headers para deshabilitar caché en el navegador
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        # Evita que Cloudflare caché también
        self.send_header('Cache-Tag', 'no-cache')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Log más legible
        sys.stderr.write("[%s] %s\n" % (
            datetime.now().strftime('%H:%M:%S'),
            format % args
        ))

def run_server(port=3006, host='0.0.0.0'):
    """Ejecuta el servidor HTTP."""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer((host, port), NoCacheHTTPRequestHandler) as httpd:
        print(f"Sirviendo Koten Frontend en http://{host}:{port}")
        print(f"Directorio: {os.getcwd()}")
        print("Headers de no-cache habilitados - el navegador no cacheará archivos")
        print("Presiona Ctrl+C para detener el servidor")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido")
            sys.exit(0)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3006))
    host = os.environ.get('HOST', '0.0.0.0')
    run_server(port, host)
