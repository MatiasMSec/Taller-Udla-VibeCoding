# 02 — Stack y componentes

| Campo | Valor |
| --- | --- |
| Proyecto | CampusFlow · RC-1 |
| Última revisión doc | 2026-10-22 |

## Resumen por capa

| Capa | Tecnología | Ubicación |
| --- | --- | --- |
| API | Node.js ≥ 24.18, **Express 5**, ESM | `rc1/api/` |
| UI | **React 19**, **Vite 8** | `rc1/web/` |
| BD | **PostgreSQL 16** | Imagen Docker + `rc1/db/init/` |
| Correo simulado | Node HTTP mínimo | `rc1/mail/` |
| Reverse proxy | **nginx 1.28** (Alpine) | `rc1/web/nginx.conf` |
| Orquestación | **Docker Compose** | `rc1/docker-compose*.yml`, raíz del taller |

## Dependencias de runtime (API)

| Paquete | Uso |
| --- | --- |
| `express` | HTTP, routing, JSON body |
| `express-session` | Sesión server-side (cookie) |
| `bcryptjs` | Verificación de contraseñas |
| `pg` | Cliente PostgreSQL |

## Dependencias de build (Web)

| Paquete | Uso |
| --- | --- |
| `react`, `react-dom` | UI |
| `vite`, `@vitejs/plugin-react` | Build y dev server |
| `@fontsource/*` | Tipografías self-hosted |

## Herramientas de taller (no runtime)

- **Semgrep**: `politicas-semgrep/`
- **Gitleaks**: `.gitleaks.toml`
- Plantillas de entrega: `plantillas/`

## Gestión de dependencias

- Lockfiles: `package-lock.json` en `api/` y `web/`.
- Imágenes base con **digest SHA** en Dockerfiles.

<!-- TODO(doc): registrar aquí cambios de versión mayor (Node, PG, Express) -->
