[![CI](https://github.com/mirNNes/svenska-elsparkcyklar/actions/workflows/ci.yml/badge.svg)](https://github.com/mirNNes/svenska-elsparkcyklar/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-jest%20--coverage-brightgreen)](#tester)

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

## Tester

### Backend
Backend har automatiserade integrationstester som körs med **Jest** och **Supertest**.

Kör lokalt:
```bash
cd backend
npm test
npm run test:coverage
