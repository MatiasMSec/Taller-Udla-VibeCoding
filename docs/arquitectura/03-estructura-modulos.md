# 03 — Estructura y módulos

| Campo | Valor |
| --- | --- |
| Proyecto | CampusFlow · RC-1 |
| Última revisión doc | 2026-10-22 |

## Árbol relevante

```
rc1/
├── api/src/
│   ├── index.js          # Bootstrap Pool + listen
│   ├── app.js            # Rutas Express, middleware global
│   ├── auth.js           # Sesión, login, requireSession
│   ├── db.js             # SQL y reglas de visibilidad en listados
│   ├── getRegistration.js # Detalle inscripción (RC-1: authz objeto incompleta)
│   ├── mailer.js         # Cliente HTTP → servicio mail
│   ├── logger.js         # Log confirmación inscripción
│   ├── present.js        # DTOs respuesta API
│   └── confirmationToken.js
├── web/src/
│   ├── App.jsx           # Routing cliente, shell
│   ├── auth.jsx          # AuthProvider, login
│   ├── pages.jsx         # Actividades, inscripciones, correo
│   ├── api.js            # fetch → /api
│   └── expediente.jsx    # Modo docente (oculto en build student)
├── mail/src/index.js     # Bandeja in-memory
└── db/init/              # Schema + seed
```

## Responsabilidades

| Módulo | Responsabilidad | No debe |
| --- | --- | --- |
| `app.js` | Orquestar HTTP, status codes, headers seguridad básicos | Contener SQL largo |
| `db.js` | Acceso datos parametrizado, transacción inscripción | Decidir permisos solo en UI |
| `auth.js` | Sesión y credenciales | Autorización por recurso (parcial en RC-1) |
| `getRegistration.js` | Lectura detalle inscripción | Asumir que listado filtrado basta |
| `web/*` | Presentación, navegación | Ser fuente única de autorización |
| `mail` | Persistencia temporal mensajes | Autenticar (no implementado RC-1) |

## Dependencias internas (API)

```
index.js → app.js → auth | db | mailer | logger | present | getRegistration
```

## Paquete taller (fuera de `rc1/`)

| Ruta | Rol |
| --- | --- |
| `docs/` | Documentación arquitectura / funcional / seguridad |
| `plantillas/` | Entregables alumno (hallazgos, dictamen, etc.) |
