[![CI](https://github.com/mirNNes/svenska-elsparkcyklar/actions/workflows/ci.yml/badge.svg)](https://github.com/mirNNes/svenska-elsparkcyklar/actions/workflows/ci.yml)

# Svenska Elsparkcyklar

Detta projekt består av tre delar: backend, frontend och en simulator för elsparkcyklar.

## Struktur

* `backend/` – Express.js API som hanterar data och logik.
* `frontend/` – Webbgränssnitt för att visa elsparkcyklar.
* `frontend-admin/` – Admin-gränssnitt för att hantera cyklar, städer, användare och resor.
* `simulator/` – Genererar testdata för backend.
* `docs/` – Dokumentation och referenser.

## Kör projektet

Använd Docker Compose för att starta alla tjänster samtidigt:

```bash
docker-compose up --build
```

## Admin OAuth (GitHub)

För admin-inloggning via GitHub OAuth används backendens `/api/auth/github`.
Sätt `ADMIN_REDIRECT_URL` till admin-frontendens adress:

```
ADMIN_REDIRECT_URL=http://localhost:3003
# Vite dev (om du kör admin lokalt utan Docker):
# ADMIN_REDIRECT_URL=http://localhost:5173
```
