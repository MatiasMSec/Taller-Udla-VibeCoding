# 04 — Validación de entradas, integridad y prevención de inyecciones

**Alcance:** SQL y otras inyecciones, esquemas de entrada, XSS, dependencias de terceros (SCA).  
**Referencias:** OWASP Top 10 A03:2021 Injection, A06:2021 Vulnerable Components, A08:2021 Software Integrity; ISO/IEC 27001 A.14.2.

---

## 4.1 Prevención de inyecciones y sanitización

### Base de datos

| ID | Requisito | Estándar |
| --- | --- | --- |
| INJ-01 | Usar **exclusivamente** consultas parametrizadas, prepared statements u ORM seguro; **nunca** concatenar input de usuario en SQL. | OWASP A03 |
| INJ-02 | Validar identificadores (UUID, slugs permitidos) con **whitelist** antes de usarlos en queries. | OWASP A03 |

### Validación de entradas (whitelisting)

| ID | Requisito | Estándar |
| --- | --- | --- |
| VAL-01 | Validar **tipo, longitud, formato y rango** de: query params, path params, headers relevantes, JSON body. | OWASP A03 |
| VAL-02 | Preferir esquemas formales (**Zod**, **Joi**, **Pydantic**, etc.) en capa de borde (controller/router). | OWASP A03 |
| VAL-03 | Rechazar campos desconocidos en operaciones sensibles o documentar política `stripUnknown`. | OWASP API3 |
| VAL-04 | Límites de tamaño de payload (p. ej. `express.json({ limit })`) en todos los servicios HTTP. | API4 |

### XSS (Cross-Site Scripting)

| ID | Requisito | Estándar |
| --- | --- | --- |
| XSS-01 | Escapar/codificar datos al renderizar HTML; en SPAs preferir binding seguro de React/Vue sin `dangerouslySetInnerHTML` sin sanitizar. | OWASP A03 |
| XSS-02 | Si se renderiza Markdown/HTML de terceros, usar allowlist de etiquetas/enlaces; bloquear `javascript:` y URLs no confiables. | OWASP A03 |
| XSS-03 | Content-Security-Policy (CSP) en producción cuando el stack lo permita. | OWASP A05 |

### Otras inyecciones

- **Command injection:** no pasar input a `exec`/`spawn` sin allowlist.
- **SSRF:** validar URLs destino en integraciones; no permitir que el usuario defina hosts internos arbitrarios.
- **Deserialización:** evitar deserializar datos no confiables sin firma; preferir JSON con esquema.

### Checklist para agentes

- [ ] ¿Toda query usa parámetros `$1`/`?` y no template strings con user input?
- [ ] ¿Hay regex/schema para IDs en rutas?
- [ ] ¿Formularios/API nuevos tienen esquema de validación?

---

## 4.2 Integridad del software y dependencias (SCA)

| ID | Requisito | Estándar |
| --- | --- | --- |
| SCA-01 | Ejecutar **SCA** en CI/CD: `npm audit`, Dependabot, OWASP Dependency-Check u equivalente. | OWASP A06 |
| SCA-02 | Bloquear o remediar dependencias con CVEs **high/critical** sin excepción documentada y fecha de remediación. | OWASP A06 |
| SCA-03 | Fijar versiones o rangos acotados; revisar lockfiles en PRs que tocan dependencias. | ISO A.14.2 |
| SCA-04 | Imágenes base Docker con digest o tags mantenidos; escaneo de imagen (Trivy, etc.) en pipeline cuando exista. | ISO A.14.2 |

### Checklist para agentes

- [ ] ¿`npm audit`/equivalente ejecutado tras cambiar `package.json`?
- [ ] ¿Se documenta excepción si se acepta un CVE temporal?

---

## Relación con otros documentos

- Autorización tras validar: [02-autorizacion-control-accesos-apis.md](./02-autorizacion-control-accesos-apis.md)
- Errores de validación al cliente: [05-errores-logging-auditoria.md](./05-errores-logging-auditoria.md)
