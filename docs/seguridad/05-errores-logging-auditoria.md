# 05 — Manejo de errores, logging y auditoría

**Alcance:** eventos de seguridad, logs estructurados, respuestas de error al usuario, minimización de PII.  
**Referencias:** ISO/IEC 27001 A.12.4 (registro y monitoreo); OWASP Top 10 A09:2021 Security Logging and Monitoring Failures.

---

## 5.1 Registro de eventos de seguridad

### Eventos que deben registrarse

| Evento | Ejemplo de campos (sin secretos) |
| --- | --- |
| Login fallido | `event`, `timestamp`, `correlationId`, identificador redactado, IP/hash IP |
| Login exitoso | `event`, `userId`, `correlationId`, `timestamp` |
| Logout / revocación | `userId`, `sessionId` truncado |
| Acceso denegado (403/401) | `resource`, `action`, `actorId`, `correlationId` |
| Cambio de privilegios | `actor`, `target`, `oldRole`, `newRole` |
| Validación crítica fallida | `schema`, `field` (no valor sensible) |

### Reglas de contenido de logs

| ID | Requisito | Estándar |
| --- | --- | --- |
| LOG-01 | Logs **estructurados** (JSON preferido) con marca temporal precisa (UTC o offset documentado). | ISO A.12.4 |
| LOG-02 | **No registrar:** contraseñas, tokens completos, refresh tokens, cookies de sesión, claves API, CVV, códigos OTP/MFA completos. | ISO A.12.4, GDPR práctica |
| LOG-03 | **Minimizar PII:** emails completos, teléfonos y documentos de identidad deben **redactarse** (p. ej. `a***@dominio.test`) salvo necesidad legal auditada. | ISO A.12.4 |
| LOG-04 | Códigos de verificación operativos (mesa, reset) **no** deben aparecer en logs agregados; usar ID de transacción correlacionable. | Política organizacional |
| LOG-05 | Retención y acceso a logs acotados por rol; integridad protegida en producción (append-only, SIEM). | ISO A.12.4 |

### Checklist para agentes

- [ ] ¿Nuevo `console.log`/logger evita PII y secretos?
- [ ] ¿Fallos de auth generan evento auditable?
- [ ] ¿403 por IDOR se registran para detección de abuso?

---

## 5.2 Manejo seguro de excepciones y mensajes al cliente

| ID | Requisito | Estándar |
| --- | --- | --- |
| ERR-01 | Respuestas al cliente **genéricas** para errores 5xx; sin stack trace, rutas de archivo ni versiones internas. | OWASP A09 |
| ERR-02 | Errores 4xx: mensajes útiles pero sin filtrar existencia de recursos ajenos si la política es anti-enumeración. | OWASP A01 |
| ERR-03 | Incluir **correlationId** en respuestas de error para soporte, no para depuración pública del stack. | Buena práctica |
| ERR-04 | En producción, detalle técnico solo en logs servidor-side vinculado por `correlationId`. | ISO A.12.4 |

### Anti-patrones prohibidos

- `res.json({ error: err.stack })`
- Loguear cuerpo completo de login con contraseña
- Exponer nombres de tablas/columnas en mensajes UI

### Checklist para agentes

- [ ] ¿Middleware de errores oculta detalles en status ≥ 500?
- [ ] ¿Los mensajes UI no revelan arquitectura interna?

---

## 5.3 Monitoreo y respuesta (orientación)

- Alertas sobre picos de login fallido, muchos 403 desde una sesión, rate limit excedido.
- Playbook documentado para correlacionar `correlationId` entre API, proxy y logs.

---

## Relación con otros documentos

- Tokens/sesiones no en logs: [01-autenticacion-identidad-sesiones.md](./01-autenticacion-identidad-sesiones.md)
- Secretos no en logs: [03-secretos-configuracion-criptografia.md](./03-secretos-configuracion-criptografia.md)
- Validación fallida: [04-validacion-entradas-integridad.md](./04-validacion-entradas-integridad.md)
