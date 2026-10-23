# 01 — Autenticación, gestión de identidades y sesiones

**Alcance:** registro e inicio de sesión, almacenamiento de credenciales, emisión y revocación de tokens/sesiones, MFA.  
**Referencias:** NIST SP 800-63 (800-63B verificadores), ISO/IEC 27001 A.9 (control de acceso), A.9.4 (gestión de información de autenticación).

---

## 1.1 Gestión y almacenamiento de credenciales

### Obligatorio

| ID | Requisito | Estándar |
| --- | --- | --- |
| AUTH-CRED-01 | **Nunca** almacenar contraseñas en texto plano ni reversibles sin justificación criptográfica formal. | NIST 800-63B, ISO A.9.4 |
| AUTH-CRED-02 | Usar funciones de derivación adaptativas con sal: **Argon2id** (preferido) o **bcrypt** con factor de costo **≥ 12** (o equivalente calibrado al hardware objetivo). | NIST 800-63B |
| AUTH-CRED-03 | Longitud mínima **8** caracteres; **recomendado 12+**. Permitir espacios y Unicode; no imponir rotaciones artificiales de complejidad si perjudican usabilidad. | NIST 800-63B |
| AUTH-CRED-04 | Validar contraseñas contra listas de filtradas/comunes (Have I Been Pwned, diccionarios internos) cuando el flujo lo permita. | NIST 800-63B |
| AUTH-CRED-05 | En respuestas de login fallido, usar mensajes **genéricos** que no confirmen existencia de cuenta (salvo requisito legal explícito). | OWASP A07 |

### Prohibido

- Guardar contraseñas en logs, tickets, métricas o trazas.
- Enviar contraseñas por canales no cifrados.
- Comparar contraseñas con `==` sobre texto plano persistido.

### Checklist para agentes

- [ ] ¿El hash usa algoritmo aprobado y costo/documentación adecuados?
- [ ] ¿Los seeds/fixtures usan hashes y no plaintext?
- [ ] ¿Los tests no imprimen contraseñas?

---

## 1.2 Protocolos de autenticación y verificadores

### Tokens y sesiones en APIs

| ID | Requisito | Estándar |
| --- | --- | --- |
| AUTH-TOK-01 | Para APIs stateless o híbridas, usar **JWT** firmados criptográficamente (**RS256** preferido en multi-servicio; **HS256** solo con clave de alta entropía y rotación). | NIST 800-63B |
| AUTH-TOK-02 | **Access Token:** vida útil corta, **máximo 15–30 minutos**. | NIST 800-63B |
| AUTH-TOK-03 | **Refresh Token:** almacenar en cookie con **HttpOnly**, **Secure** (en HTTPS), **SameSite=Strict** o **Lax** según flujo cross-site. | OWASP Session Management |
| AUTH-TOK-04 | No almacenar tokens de acceso en `localStorage`/`sessionStorage` si existe riesgo XSS. | OWASP |

### Sesiones server-side (alternativa válida)

Si se usa `express-session` u equivalente:

- Cookie de sesión: **HttpOnly**, **Secure** en producción, **SameSite** acorde al modelo de amenazas.
- Secreto de firma de sesión: alta entropía, **≥ 32 bytes** en producción, desde gestor de secretos.

### Autenticación multifactor (MFA)

| ID | Requisito | Estándar |
| --- | --- | --- |
| AUTH-MFA-01 | **MFA obligatoria** para roles administrativos y operaciones críticas (eliminación masiva, cambio de roles, exportación de PII). | NIST 800-63B |
| AUTH-MFA-02 | Mecanismos preferidos: **FIDO2 / WebAuthn**; alternativa: **TOTP** (RFC 6238). Evitar MFA solo por SMS como factor único fuerte. | NIST 800-63B |

### Checklist para agentes

- [ ] ¿Access vs refresh separados con TTL correctos?
- [ ] ¿Cookies cumplen HttpOnly/Secure/SameSite en el entorno objetivo?
- [ ] ¿Operaciones admin exigen MFA o hay plan documentado?

---

## 1.3 Ciclo de vida de sesiones

| ID | Requisito | Estándar |
| --- | --- | --- |
| AUTH-SES-01 | **Logout:** invalidación explícita en servidor (destruir sesión / revocar refresh token en allowlist o blocklist). | ISO A.9.4.2 |
| AUTH-SES-02 | Tras login exitoso: **regenerar ID de sesión** y emitir nueva cookie para mitigar **fijación de sesión**. | OWASP |
| AUTH-SES-03 | Expiración por inactividad y absoluta; al invalidar, rechazar peticiones subsiguientes con el identificador antiguo. | ISO A.9.4.2 |
| AUTH-SES-04 | Invalidar sesiones ante cambio de contraseña o revocación de privilegios cuando sea posible. | NIST 800-63B |

### Checklist para agentes

- [ ] ¿`logout` destruye sesión/token en servidor?
- [ ] ¿Post-login hay `session.regenerate` o equivalente?
- [ ] ¿Sesiones huérfanas se limpian (TTL/store)?

---

## Relación con otros documentos

- Autorización tras autenticar: [02-autorizacion-control-accesos-apis.md](./02-autorizacion-control-accesos-apis.md)
- Secretos (`SESSION_SECRET`, claves JWT): [03-secretos-configuracion-criptografia.md](./03-secretos-configuracion-criptografia.md)
- Logs de login fallido: [05-errores-logging-auditoria.md](./05-errores-logging-auditoria.md)
