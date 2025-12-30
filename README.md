[![CI](https://github.com/mirNNes/svenska-elsparkcyklar/actions/workflows/ci.yml/badge.svg)](https://github.com/mirNNes/svenska-elsparkcyklar/actions/workflows/ci.yml)

# Svenska Elsparkcyklar

Detta projekt består av tre delar: backend, frontend och en simulator för elsparkcyklar.

## Struktur

- `backend/` – Express.js API som hanterar data och logik.
- `frontend/` – Webbgränssnitt för att visa elsparkcyklar.
- `frontend-admin/` – Admin-gränssnitt för att hantera cyklar, städer, användare och resor.
- `simulator/` – Genererar testdata för backend.
- `docs/` – Dokumentation och referenser.

## Kör projektet

Använd Docker Compose för att starta alla tjänster samtidigt:

```bash
docker-compose up --build
```

## Admin OAuth (GitHub)

Admin-inloggning via GitHub startas från backendens `/api/auth/github`.

**Starta OAuth:**

- Docker: `http://localhost:3001/api/auth/github`
- Utan Docker (backend lokalt): `http://localhost:5000/api/auth/github`

**Redirect efter login (admin‑UI):**
