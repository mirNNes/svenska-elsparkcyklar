[![CI](https://github.com/mirNNes/svenska-elsparkcyklar/actions/workflows/ci.yml/badge.svg)](https://github.com/mirNNes/svenska-elsparkcyklar/actions/workflows/ci.yml)

# Svenska Elsparkcyklar

Detta projekt består av tre delar: backend, frontend och en simulator för elsparkcyklar.

## Struktur

- `backend/` – Express.js API som hanterar data och logik.
- `frontend-customer-app/` – Kundapplikation för att hyra elsparkcyklar.
- `frontend-customer-website/` – Kundwebb för att hantera konto, se reshistorik och fakturor.
- `frontend-admin/` – Admin-gränssnitt för att hantera cyklar, städer, användare och resor.
- `simulator/` – Genererar testdata för backend.
- `docs/` – Dokumentation och referenser.

## Kör projektet

Använd Docker Compose för att starta alla tjänster samtidigt:

```bash
docker-compose up --build
```
