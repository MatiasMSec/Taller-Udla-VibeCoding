# 04 — Despliegue y runtime

| Campo | Valor |
| --- | --- |
| Proyecto | CampusFlow · RC-1 |
| Última revisión doc | 2026-10-22 |

## Servicios Compose (estudiante)

| Servicio | Puerto host | Proceso | Notas |
| --- | --- | --- | --- |
| `web` | `127.0.0.1:8080` | nginx + SPA estático | Proxy `/api/` → API |
| `api` | `127.0.0.1:3000` | `node src/index.js` | Usuario `node` en imagen |
| `db` | `127.0.0.1:5433` | PostgreSQL 16 | Volumen `pgdata` |
| `mail` | `127.0.0.1:8025` | Node HTTP | Bandeja simulada |

Arranque documentado: `docker compose -f docker-compose.student.yml up` (desde layout del paquete con rutas `./api`, `./db`; en monorepo docente usar `rc1/`).

## Variables de entorno (nombres, sin secretos)

| Variable | Consumidor | Descripción |
| --- | --- | --- |
| `POSTGRES_PASSWORD` | db, api (`DATABASE_URL`) | Obligatoria en compose |
| `SESSION_SECRET` | api | Firma de cookie de sesión |
| `DATABASE_URL` | api | Cadena Postgres (compose la arma) |
| `MAIL_URL` | api | Base URL servicio mail (interno) |
| `RELEASE` | api | Etiqueta RC (`RC-1`) |
| `PORT` | api | Puerto HTTP (3000) |
| `LOG_PATH` | api (opcional) | Archivo append logs confirmación |
| `VITE_CAMPUSFLOW_UI` | build web | `student` oculta expediente |

Plantilla local: `.env.example` en raíz del paquete.

## Red y confianza

- API: `trust proxy` = 1 (detrás de nginx).
- Cookie sesión: `httpOnly`, `sameSite: lax`, `secure: false` (HTTP local).
- Mail y API escuchan `0.0.0.0` **dentro** del contenedor; exposición acotada por bind localhost en host.

## Healthchecks

- API: `GET /health`
- Mail: `GET /health`
- DB: `pg_isready`

## Reset operativo (taller)

- SQL: `rc1/db/reset.sql`
- Vaciar bandeja: `DELETE http://127.0.0.1:8025/messages`
