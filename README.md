[![CI](https://github.com/mirNNes/svenska-elsparkcyklar/actions/workflows/ci.yml/badge.svg)](https://github.com/mirNNes/svenska-elsparkcyklar/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-jest%20--coverage-brightgreen)](#tester)

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

## Tester

### Backend
Backend har automatiserade integrationstester som körs med **Jest** och **Supertest**.

Kör lokalt:
```bash
cd backend
npm test
npm run test:coverage
```

### Kodkvalitet och CI-verifiering

Projektet använder automatiserad kodkvalitetskontroll som en del av CI-flödet.

- **ESLint** används för statisk analys av koden för att validera kodstandard och identifiera potentiella problem (“mess detection”).
- Kodkvalitetskontroller körs automatiskt via **GitHub Actions** vid varje push och pull request.
- Bygget misslyckas om tester eller kodstandard inte uppfylls.

Detta säkerställer att både funktionalitet och kodkvalitet verifieras automatiskt.
