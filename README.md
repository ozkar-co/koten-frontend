# Koten Frontend (minimal)

Frontend estatico y responsive en espanol para consumir Koten API.

## API publica

Base URL: `https://koten-api.ozkr.net`

Endpoints usados por este frontend:

- `GET /lore/index`
- `GET /lore/races/{slug}`
- `GET /lore/lang/{slug}`
- `GET /word/{language}/{word}`
- `POST /lexicon/analyze`
- `GET /lexicon/roots/{root}`

OpenAPI:

- `https://koten-api.ozkr.net/openapi.json`

## Ejecutar

Al ser estatico, puedes abrir `index.html` directamente o servir la carpeta con cualquier servidor web simple.

## Estructura

- `index.html`: layout principal y secciones Lore/Lexicon
- `styles.css`: estilo minimalista + responsive
- `app.js`: integracion con API y logica de UI
