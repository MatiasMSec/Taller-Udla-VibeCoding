# 03 — Secretos, configuración y criptografía

**Alcance:** TLS, cifrado en reposo, gestión de claves y variables, endurecimiento de entornos.  
**Referencias:** ISO/IEC 27001 A.10 (criptografía), A.14.1 (seguridad en desarrollo); OWASP Top 10 A05:2021 Security Misconfiguration.

---

## 3.1 Protección criptográfica de datos

### Datos en tránsito

| ID | Requisito | Estándar |
| --- | --- | --- |
| CRYPTO-TLS-01 | **HTTPS obligatorio** en producción y entornos expuestos: **TLS 1.2 mínimo**, preferir **TLS 1.3**. | ISO A.10, NIST |
| CRYPTO-TLS-02 | Deshabilitar protocolos y cipher suites obsoletos o inseguros; configuración revisada periódicamente. | ISO A.10 |
| CRYPTO-TLS-03 | Cookies de sesión/token con flag **Secure** cuando se sirve por HTTPS. | OWASP |

### Datos en reposo

| ID | Requisito | Estándar |
| --- | --- | --- |
| CRYPTO-REST-01 | Cifrar PII y datos sensibles en BD/almacenamiento con algoritmos estándar (**AES-256** o equivalente aprobado). | ISO A.10 |
| CRYPTO-REST-02 | Claves de cifrado en reposo gestionadas por KMS/HSM o servicio de secretos; rotación documentada. | ISO A.10 |

*Nota laboratorio local:* puede omitirse cifrado en reposo **solo** si el README del entorno lo declara y no hay datos reales.

---

## 3.2 Gestión de secretos y configuración

### Prohibiciones

| ID | Requisito | Estándar |
| --- | --- | --- |
| SEC-01 | **Prohibido hardcoding** de credenciales, API keys, certificados o connection strings en código fuente versionado. | OWASP A05 |
| SEC-02 | **Prohibido** commitear `.env` con secretos reales; `.env` en `.gitignore`. | OWASP A05 |
| SEC-03 | Muestras en repo (`*.example`, `*.sample`) deben ser **inertes** y etiquetadas como no productivas. | OWASP A05 |

### Prácticas obligatorias

| ID | Requisito | Estándar |
| --- | --- | --- |
| SEC-04 | Desarrollo local: variables de entorno o `.env` local no versionado. | ISO A.14 |
| SEC-05 | Producción: gestor de secretos (AWS Secrets Manager, Vault, Azure Key Vault, etc.) con auditoría de acceso. | ISO A.10 |
| SEC-06 | Separar secretos por entorno (dev/staging/prod); nunca reutilizar claves de producción en dev. | ISO A.14 |
| SEC-07 | Rotar secretos tras incidente, filtración o salida de personal con acceso. | ISO A.10 |

### Endurecimiento (hardening)

| ID | Requisito | Estándar |
| --- | --- | --- |
| HARD-01 | Desactivar modos debug, stack traces al cliente y endpoints de diagnóstico en producción. | OWASP A05 |
| HARD-02 | Ocultar banners de versión innecesarios (`X-Powered-By`, etc.). | OWASP A05 |
| HARD-03 | Principio de mínima exposición de puertos; bind a localhost o red privada cuando aplique. | ISO A.13 |
| HARD-04 | Imágenes/containers: usuario no root cuando sea posible. | ISO A.14 |

### Checklist para agentes

- [ ] ¿Nuevo código lee secretos solo desde `process.env`/config inyectada?
- [ ] ¿Archivos sample no parecen secretos reales (formato, comentarios)?
- [ ] ¿Compose/prod exige variables obligatorias (`:?`) en lugar de defaults débiles?

---

## Relación con otros documentos

- JWT/session secrets: [01-autenticacion-identidad-sesiones.md](./01-autenticacion-identidad-sesiones.md)
- No loguear secretos: [05-errores-logging-auditoria.md](./05-errores-logging-auditoria.md)
