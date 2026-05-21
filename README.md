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

## Principios de desarrollo

- **KISS**: el codigo minimo posible. Cuantas menos lineas, mejor.
- **No inventar contenido**: si el backend no lo tiene, mostrar el error real.
- **No hardcodear listas**: todo viene del backend.
- **El HTML es solo estructura**: la logica vive en JS.
- **No parchear layouts con hacks CSS**: si el layout falla, simplificar la estructura.
- **Fail Fast**: si algo no cumple contrato, la app falla explícitamente en vez de ocultarlo
