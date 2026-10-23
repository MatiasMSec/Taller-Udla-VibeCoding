# 06 — Registro de decisiones arquitectónicas (ADR)

Formato por entrada: **contexto → decisión → consecuencias**. Numeración `ADR-NNN`.

---

## ADR-001 — Sesión server-side con cookie en lugar de JWT

| | |
| --- | --- |
| **Estado** | Aceptada (RC-1) |
| **Contexto** | Monolito Express + SPA same-origin detrás de nginx. |
| **Decisión** | `express-session` + cookie `campusflow.sid`, store por defecto en memoria. |
| **Consecuencias** | Simple para laboratorio; no escala horizontal sin store compartido. Directivas org prefieren JWT para APIs públicas — ver [../seguridad/01-autenticacion-identidad-sesiones.md](../seguridad/01-autenticacion-identidad-sesiones.md) para evolución a producción. |

---

## ADR-002 — Correo como servicio HTTP separado in-memory

| | |
| --- | --- |
| **Estado** | Aceptada (RC-1) |
| **Contexto** | Taller sin SMTP real; alumnos deben ver confirmaciones localmente. |
| **Decisión** | Micro-servicio Node en puerto 8025, mensajes en memoria + seed JSON. |
| **Consecuencias** | Sin autenticación entre servicios; riesgo si el puerto se expone — mitigado por bind `127.0.0.1` en compose estudiantil. |

---

## ADR-003 — Autorización de listados en SQL, detalle delegado a RC-2

| | |
| --- | --- |
| **Estado** | Aceptada (RC-1, deuda conocida) |
| **Contexto** | Entrega inicial para auditoría (BOLA). |
| **Decisión** | `listVisibleRegistrations` filtra por rol; `readRegistration` no replica la regla. |
| **Consecuencias** | IDOR en `GET /registrations/:id` — documentado en código y [../funcional/05-contratos-interfaces.md](../funcional/05-contratos-interfaces.md). |

---

<!-- Plantilla para nuevas ADR:

## ADR-NNN — Título

| | |
| --- | --- |
| **Estado** | Propuesta / Aceptada / Obsoleta |
| **Contexto** | |
| **Decisión** | |
| **Consecuencias** | |

-->
