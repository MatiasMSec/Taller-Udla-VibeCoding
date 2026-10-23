# 02 — Autorización, control de accesos y APIs

**Alcance:** permisos por rol y por recurso, endpoints HTTP, prevención BOLA/IDOR, límites de consumo.  
**Referencias:** OWASP Top 10 A01:2021, A05:2021; OWASP API Security Top 10 (2023) API1, API3, API4; ISO/IEC 27001 A.9.1.1.

---

## 2.1 Control de acceso rígido

### Principios

| ID | Requisito | Estándar |
| --- | --- | --- |
| AUTHZ-01 | **Menor privilegio:** ningún usuario ni servicio recibe más permisos de los estrictamente necesarios. | ISO A.9.1.1 |
| AUTHZ-02 | **Autorización en servidor:** toda ruta/endpoints valida rol y permisos en backend; el frontend solo refleja UI, nunca es fuente de verdad. | OWASP A01 |
| AUTHZ-03 | Tras `requireAuth`, **siempre** comprobar autorización sobre el **objeto** solicitado (no basta con «está logueado»). | OWASP API1 |

### Prevención IDOR / BOLA

| ID | Requisito | Estándar |
| --- | --- | --- |
| AUTHZ-IDOR-01 | En `GET/PATCH/DELETE /recurso/:id`, verificar que el actor puede acceder a **ese** `id` (p. ej. `resource.owner_id === currentUser.id` o regla de coordinación documentada). | OWASP A01, API1 |
| AUTHZ-IDOR-02 | Preferir **404** o **403** consistente según política de producto; no filtrar solo en listados dejando el detalle abierto. | OWASP API1 |
| AUTHZ-IDOR-03 | IDs predecibles (secuenciales, patrones `userId-entityId`) exigen **controles de autorización fuertes**, no confiar en oscuridad. | OWASP API1 |

### Patrón de implementación esperado

```
1. Autenticar (sesión/JWT válido)
2. Cargar recurso o comprobar pertenencia en la misma consulta (WHERE owner = $user)
3. Si no autorizado → 403/404
4. Serializar respuesta mínima (ver API3)
```

### Checklist para agentes

- [ ] ¿Cada handler con `:id` tiene chequeo de propiedad/rol sobre ese id?
- [ ] ¿Los listados y el detalle usan la **misma** regla de visibilidad?
- [ ] ¿No hay endpoints «solo ocultos en UI»?

---

## 2.2 Seguridad en endpoints (OWASP API Top 10)

### API1:2023 — Broken Object Level Authorization

- Implementar control **por función** que toque datos (no un middleware genérico sin contexto de objeto).
- Tests: usuario A no puede leer/modificar recurso de usuario B.

### API3:2023 — Broken Object Property Level Authorization

| ID | Requisito | Estándar |
| --- | --- | --- |
| AUTHZ-API3-01 | **Excessive Data Exposure:** respuestas con DTOs/campos explícitos; no devolver filas completas de BD. | API3 |
| AUTHZ-API3-02 | **Mass Assignment:** allowlist de campos aceptados en `POST/PATCH`; ignorar o rechazar campos de privilegio (`role`, `isAdmin`, etc.). | API3 |
| AUTHZ-API3-03 | Coordinadores/admin: exponer solo campos necesarios para la operación (email completo solo si el caso de uso lo exige). | API3, ISO A.9 |

### API4:2023 — Unrestricted Resource Consumption

| ID | Requisito | Estándar |
| --- | --- | --- |
| AUTHZ-API4-01 | **Rate limiting** en login, registro, búsquedas costosas y APIs públicas. | API4 |
| AUTHZ-API4-02 | **Paginación** obligatoria en listados que puedan crecer (cursor o offset con límite máximo). | API4 |
| AUTHZ-API4-03 | Límites de tamaño de body (JSON, uploads) y timeouts razonables. | API4 |

### Checklist para agentes

- [ ] ¿Hay rate limit en auth y escrituras sensibles?
- [ ] ¿Listados tienen `limit`/`cursor` acotado?
- [ ] ¿Las respuestas usan funciones `toPublic*` / serializers?

---

## 2.3 Servicios internos y microservicios

- Comunicación servicio-a-servicio: autenticación mutua (mTLS, token de servicio) cuando el servicio no es localhost aislado.
- No confiar en «red privada» sin autenticación (p. ej. bandeja de correo interna sin token).

---

## Relación con otros documentos

- Credenciales y sesión: [01-autenticacion-identidad-sesiones.md](./01-autenticacion-identidad-sesiones.md)
- Validación de IDs en URL/body: [04-validacion-entradas-integridad.md](./04-validacion-entradas-integridad.md)
- Auditoría de accesos denegados: [05-errores-logging-auditoria.md](./05-errores-logging-auditoria.md)
