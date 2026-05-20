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

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler HTTP que añade headers para deshabilitar caché."""
    
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
