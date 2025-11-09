# Svenska Elsparkcyklar

Detta projekt består av tre delar: backend, frontend och en simulator för elsparkcyklar.

## Struktur

* `backend/` – Express.js API som hanterar data och logik.
* `frontend/` – Webbgränssnitt för att visa elsparkcyklar.
* `simulator/` – Genererar testdata för backend.
* `docs/` – Dokumentation och referenser.

## Kör projektet

Använd Docker Compose för att starta alla tjänster samtidigt:

```bash
docker-compose up --build
