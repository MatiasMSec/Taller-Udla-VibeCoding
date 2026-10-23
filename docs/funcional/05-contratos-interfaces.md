# 05 — Contratos e interfaces

| Campo | Valor |
| --- | --- |
| Proyecto | CampusFlow · RC-1 |
| Última revisión doc | 2026-10-22 |

## API REST (prefijo público `/api`)

Base URL laboratorio: `http://127.0.0.1:8080/api`.

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| GET | `/health` | No | Salud servicio |
| GET | `/meta` | No | Metadatos release |
| POST | `/auth/login` | No | Body: `{ username, password }` |
| GET | `/auth/me` | Sesión | Usuario actual |
| POST | `/auth/logout` | Sesión | Cierra sesión |
| GET | `/activities` | No | Catálogo |
| GET | `/activities/:id` | Sesión | Detalle + roster visible |
| GET | `/registrations` | Sesión | Listado visible por rol |
| GET | `/registrations/:id` | Sesión | Detalle — **RC-1: sin chequeo objeto (IDOR)** |
| POST | `/registrations` | Sesión (student) | Body: `{ activityId }` |
| GET | `/messages` | Sesión | Bandeja filtrada |

### Validación de IDs en rutas

- Actividad: `^act-[a-z0-9-]{3,48}$`
- Inscripción: `^reg-[a-z0-9-]{3,48}$`

### Respuestas de error

JSON `{ error, correlationId? }`; 5xx genéricos al cliente (ver [../seguridad/05-errores-logging-auditoria.md](../seguridad/05-errores-logging-auditoria.md)).

## Servicio mail (interno)

| Método | Ruta | Auth RC-1 |
| --- | --- | --- |
| GET | `/health` | No |
| GET | `/messages` | No |
| POST | `/messages` | No |
| DELETE | `/messages` | No |

Body POST: `{ to, subject, text, correlationId?, registrationId? }`.

## Cliente web

- Wrapper: `rc1/web/src/api.js` → `fetch('/api…', { credentials: 'same-origin' })`.
- Implementación referencia: `rc1/api/src/app.js`.

<!-- TODO(doc): mantener esta tabla sincronizada con app.js en cada cambio de ruta -->
