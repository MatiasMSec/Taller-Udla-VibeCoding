# 03 — Flujos principales

| Campo | Valor |
| --- | --- |
| Proyecto | CampusFlow · RC-1 |
| Última revisión doc | 2026-10-22 |

## Flujo 1 — Autenticación y carga inicial

1. Usuario abre `http://127.0.0.1:8080`.
2. SPA llama `GET /api/auth/me` con cookie.
3. Si 401 → pantalla login; si 200 → shell con navegación y `GET /api/meta` (release).

## Flujo 2 — Explorar e inscribirse

1. `GET /api/activities` (público) alimenta tarjetas en `/`.
2. Usuario autenticado entra a `/actividades/:id` → `GET /api/activities/:id` (sesión + roster).
3. Estudiante pulsa Inscribirme → `POST /api/registrations` `{ activityId }`.
4. API: transacción BD, `POST` mail, `logConfirmation`, respuesta con DTO + `deskVerificationCode`.
5. UI sugiere ir a `/correo` → `GET /api/messages`.

## Flujo 3 — Coordinadora revisa roster

1. Desde detalle de actividad coordinada, lista de inscripciones visibles.
2. Abrir detalle → navegación a `/inscripciones/:id` → `GET /api/registrations/:id`.

## Flujo 4 — Cierre de sesión

1. `POST /api/auth/logout` → destruye sesión → UI limpia usuario.

## Diagrama — inscripción (resumen)

Ver secuencia en [../arquitectura/05-datos-integraciones.md](../arquitectura/05-datos-integraciones.md).

## Rutas UI (cliente)

| Ruta | Pantalla |
| --- | --- |
| `/` | Actividades |
| `/actividades/:id` | Detalle + inscripción / roster |
| `/inscripciones` | Listado |
| `/inscripciones/:id` | Detalle cupo |
| `/correo` | Bandeja |

Modo docente (no build student): `/expediente`, `/expediente/ver/:id` — archivos estáticos vía nginx.
