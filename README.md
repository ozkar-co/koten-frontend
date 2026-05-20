# Koten Frontend (minimal)

Frontend estatico y responsive en espanol para consumir Koten API.

## API publica

Base URL: `https://koten-api.ozkr.net`

OpenAPI: `https://koten-api.ozkr.net/openapi.json`

## Ejecutar

Con script unificado para local y server (puerto 3006 por defecto):

```bash
./run.sh
```

Variables opcionales:

- `PORT` (default: `3006`)
- `HOST` (default: `0.0.0.0`)

Ejemplo:

```bash
PORT=3006 HOST=0.0.0.0 ./run.sh
```

## Estructura

- `index.html`: layout principal con menu superior (Inicio, Lore, Lexicon, Login)
- `styles.css`: estilo minimalista + responsive
- `run.sh`: servidor estatico para local/server
- `src/main.js`: bootstrap, navegacion superior y menu contextual
- `src/service.js`: conexion con backend Koten API
- `src/views/`: vistas de cada seccion
