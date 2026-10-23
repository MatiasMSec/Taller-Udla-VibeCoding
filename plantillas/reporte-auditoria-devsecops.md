# Reporte de auditoría DevSecOps — CampusFlow RC-1

| Campo | Valor |
| --- | --- |
| Proyecto | CampusFlow · RC-1 (laboratorio estudiantil) |
| Repositorio | Taller-Udla-VibeCoding / `rc1/` |
| Fecha del reporte | 2026-10-22 |
| Última actualización | 2026-10-22 (DAST + Trivy image) |
| Alcance | API Express, SPA React, mail simulado, PostgreSQL, Docker Compose, config taller |
| Referencias normativas | `docs/seguridad/01`–`07`, pipeline `docs/seguridad/06-auditoria-devsecops-pipeline.md` |

---

## 1. Resumen ejecutivo

Se ejecutó el pipeline completo: **Secret Scanning → SCA → SAST → revisión estática → Trivy FS → stack Docker levantado → DAST (Nuclei + revisión manual de cabeceras) → Trivy image (api, web, mail)**. OWASP ZAP no está instalado en el entorno.

| Severidad | Cantidad (código + dinámico) | Acción esperada |
| --- | --- | --- |
| **Alta** | 2 | Corregir (IDOR, logging) |
| **Media** | 8 | RC-2 / hardening (incl. cabeceras, mail, DoS URL) |
| **Baja / informativo** | 5 | Mejora o exención documentada |
| **Infra / contenedor (Trivy OS)** | Muchas HIGH/CRITICAL en capa base | Rebuild bases; exención solo en lab |
| **Aceptado (taller)** | 1 | Webhook inerte (Gitleaks) |

**Quality gate npm (aplicación):** cumplido (solo **LOW** en `express-session`).  
**Quality gate imágenes Docker (Trivy HIGH/CRITICAL en OS):** **no cumplido** para criterio estricto de producción (Debian/Alpine base con decenas de CVEs; ver §3.6).  
**Semgrep org:** **1 hallazgo bloqueante** (logging).

---

## 2. Pipeline ejecutado

| Orden | Fase | Herramienta | Estado |
| --- | --- | --- | --- |
| 1 | Secret Scanning | Gitleaks (`.gitleaks.toml` + default) | Ejecutado |
| 2 | SCA | `npm audit` (`rc1/api`, `rc1/web`) | Ejecutado |
| 3 | SAST | Semgrep org + `--config auto` | Ejecutado |
| 3b | Auditoría agente | Revisión manual alineada a Cloudflare `security-audit` | Parcial (sin `findings.json`) |
| 4 | Container FS | Trivy FS sobre `rc1/api/package-lock.json` | Ejecutado |
| 4b | Container image | Trivy `image` api, web, mail | Ejecutado |
| 5 | DAST | Nuclei + cabeceras HTTP manuales | Ejecutado (ZAP: N/A) |
| — | Runtime | `docker compose -f rc1/docker-compose.student.yml up` | Ejecutado |

---

## 3. Evidencia de herramientas

### 3.1 Gitleaks

**Comando (política taller):**

```bash
gitleaks detect --source . --config .gitleaks.toml --no-git -v
```

**Resultado:** 1 hallazgo.

| Campo | Valor |
| --- | --- |
| Regla | `campusflow-inert-webhook-in-repo` |
| Archivo | `rc1/config/integraciones-pago.env.sample` |
| Línea | 5 |
| Contenido detectado | `STRIPE_WEBHOOK_SECRET=CampusFlowInertLabOnly000000000001` |
| Notas | Valor **inerte** de laboratorio; alerta esperada con regla custom del taller |

**Comando (reglas por defecto):**

```bash
gitleaks detect --source . --no-git
```

**Resultado:** 1 hallazgo (mismo patrón).

---

### 3.2 SCA — npm audit

**API (`rc1/api/`):**

- 2 vulnerabilidades **LOW**
- Cadena: `express-session@1.18.1` → `on-headers` &lt; 1.1.0
- Advisory: [GHSA-76c9-3jph-rj3q](https://github.com/advisories/GHSA-76c9-3jph-rj3q) (manipulación de headers HTTP)
- Fix sugerido: `express-session@1.19.0`

**Web (`rc1/web/`):**

- 0 vulnerabilidades

---

### 3.3 SAST — Semgrep

**Política organizacional:**

```bash
semgrep --config politicas-semgrep/log-minimizacion-email.yaml rc1/api/src
```

| Resultado | Detalle |
| --- | --- |
| Findings | 1 (blocking) |
| Regla | `politicas-semgrep.campusflow-log-email-completo` |
| Archivo | `rc1/api/src/logger.js` |
| Mensaje | No registrar el correo completo en logs operativos |

**Comparación auto:**

```bash
semgrep --config auto rc1/api/src
```

**Resultado:** 0 findings (200 reglas).

---

### 3.4 Trivy (filesystem)

```bash
trivy fs --severity HIGH,CRITICAL rc1/api
```

**Resultado:** 0 vulnerabilidades HIGH/CRITICAL en `package-lock.json` (npm).

---

### 3.5 DAST — Nuclei y revisión manual

**Stack:** `rc1/docker-compose.student.yml` — servicios en `127.0.0.1:8080` (web), `:3000` (api), `:8025` (mail).

**Nuclei:**

```bash
nuclei -u http://127.0.0.1:8080 -severity low,medium,high,critical -silent -no-color
nuclei -u http://127.0.0.1:3000 -u http://127.0.0.1:8025 -severity medium,high,critical -silent -no-color
```

| Objetivo | Plantillas medium+ | Salida |
| --- | --- | --- |
| `:8080` (nginx/SPA) | 0 | `plantillas/scan-output-nuclei-8080.txt` (vacío) |
| `:3000`, `:8025` | 0 | `plantillas/scan-output-nuclei-api-mail.txt` (vacío) |

**Cabeceras y comportamiento (manual):** `plantillas/scan-output-headers-dast.txt`

| Observación | Severidad orientativa |
| --- | --- |
| Respuesta estática nginx **sin** CSP, HSTS, `X-Frame-Options`, `Permissions-Policy` | Media (hardening) |
| API vía nginx/proxy sí envía `X-Content-Type-Options`, `Referrer-Policy`, `Cache-Control` | Positivo parcial |
| **Mail:** `GET http://127.0.0.1:8025/messages` devuelve bandeja **sin autenticación** (desde host) | Media (CF-005) |
| **Mail:** tras tráfico de escaneo, proceso Node **terminó** por `TypeError: Invalid URL` al parsear `req.url` malformado (`mail/src/index.js:18`) | Media (disponibilidad / validación URL) |
| `GET /activities` devolvió **500** en la sesión de prueba (API no conectaba a PG: `pg_hba`, sin cifrado) | Operativo / config compose — repetir DAST funcional tras DB estable |

**OWASP ZAP:** no instalado (`zap.sh` ausente en PATH).

---

### 3.6 Trivy — imágenes Docker

**Comando:**

```bash
trivy image --severity HIGH,CRITICAL campusflow-rc1-student-api:latest
trivy image --severity HIGH,CRITICAL campusflow-rc1-student-web:latest
trivy image --severity HIGH,CRITICAL campusflow-rc1-student-mail:latest
```

**Salida completa:** `plantillas/scan-output-trivy-images.txt`

| Imagen | Base OS | Total HIGH+CRITICAL (Trivy) | Notas |
| --- | --- | --- | --- |
| `campusflow-rc1-student-api:latest` | Debian 12 | **68** (64 HIGH, 4 CRITICAL) | Capa SO + npm embebido en imagen node (p. ej. `tar`, `brace-expansion` en toolchain) |
| `campusflow-rc1-student-web:latest` | Alpine 3.21 | **56** (54 HIGH, 2 CRITICAL) | OpenSSL/libcrypto3, curl, c-ares en nginx alpine |
| `campusflow-rc1-student-mail:latest` | Debian 12 | **68** (64 HIGH, 4 CRITICAL) | Similar a API |

Ejemplos CRITICAL citados por Trivy: `CVE-2023-45853` (zlib, `will_not_fix`), `CVE-2026-31789` (OpenSSL en web), `CVE-2026-59873` (node-tar en capa node).

**Interpretación taller:** en laboratorio local con bind `127.0.0.1` muchos CVEs de SO son **riesgo de plataforma**, no de la lógica CampusFlow; para producción aplicar **SCAN-CTR-03** (rebuild bases, digest actualizados, exenciones documentadas).

---

## 4. Registro de hallazgos

| ID | Severidad | Categoría | Hallazgo | Evidencia principal |
| --- | --- | --- | --- | --- |
| **CF-001** | Alta | OWASP API1 / IDOR | `GET /registrations/:id` no valida autorización sobre el objeto | `rc1/api/src/getRegistration.js` |
| **CF-002** | Alta | Logging / Semgrep | Email completo y `deskVerificationCode` en logs | `rc1/api/src/logger.js` |
| **CF-003** | Media | Excessive data exposure | `deskVerificationCode` en respuesta JSON 201 además del correo | `rc1/api/src/app.js` |
| **CF-004** | Media | Criptografía débil | Código mesa con `Math.random()` | `rc1/api/src/confirmationToken.js` |
| **CF-005** | Media | Servicio interno | Mail sin autenticación; bandeja legible si puerto expuesto | `rc1/mail/src/index.js` |
| **CF-006** | Media | Access control | `GET /activities` sin sesión | `rc1/api/src/app.js` |
| **CF-007** | Media | Sesión | Sin `session.regenerate` post-login; `secure: false` en cookie | `rc1/api/src/auth.js` |
| **CF-008** | Media | API4 | Sin rate limiting en login / escrituras | `rc1/api/src/app.js` |
| **CF-009** | Baja | SCA | `express-session` / `on-headers` LOW | `npm audit` api |
| **CF-010** | Baja | Enumeración | IDs `reg-{studentId}-…` predecibles | `rc1/api/src/db.js` |
| **CF-011** | Informativo | Secret scan | Webhook inerte en sample versionado | `rc1/config/integraciones-pago.env.sample` |
| **CF-012** | Ejecutado | DAST | Nuclei sin hallazgos medium+; revisión manual sí (cabeceras, mail) | §3.5, archivos `scan-output-*` |
| **CF-DAST-001** | Media | Disponibilidad | Servicio mail cae con URL HTTP malformada en `req.url` | `mail/src/index.js`, logs Docker |
| **CF-DAST-002** | Media | Misconfig HTTP | nginx sin CSP / HSTS / X-Frame-Options en respuestas estáticas | `scan-output-headers-dast.txt` |
| **CF-CONT-001** | Infra | Container scan | Imágenes api/web/mail con decenas de CVEs HIGH/CRITICAL en SO base | `scan-output-trivy-images.txt` |

### Detalle técnico — CF-001 (IDOR / BOLA)

El listado de inscripciones filtra por rol en SQL (`listVisibleRegistrations`), pero el detalle delega en `readRegistration()` que **no comprueba** que el `actor` pueda ver ese `registrationId`. Cualquier sesión válida puede obtener email y datos de otra inscripción conocida o adivinada.

Comentario en código: *«autorización por objeto incompleta en esta entrega»*.

### Detalle técnico — CF-002 (logging)

Línea de log incluye `email=${email}` y `deskVerificationCode=…`, incumpliendo política Semgrep y `docs/seguridad/05-errores-logging-auditoria.md` (LOG-03, LOG-04).

---

## 5. Prompts para el desarrollador

Copiar cada bloque como ticket o instrucción en Cursor.

---

### Prompt 1 — CF-001 (Alta) — Corregir IDOR en detalle de inscripción

```text
Contexto: CampusFlow RC-1, API Express en rc1/api/src.

Problema: GET /registrations/:id usa readRegistration() que solo comprueba sesión y existencia del registro, no autorización por objeto (OWASP API1 BOLA). Cualquier usuario autenticado puede leer inscripciones ajenas si conoce el ID.

Tarea:
1. En getRegistration.js (o en db.js), reutiliza la misma regla que listVisibleRegistrations: estudiante solo si r.student_id === actor.id; coordinadora solo si a.coordinator_id === actor.id.
2. Si no autorizado, responde 403 o 404 según política del proyecto (documentar en docs/funcional/05-contratos-interfaces.md).
3. Añade test en rc1/api/test/ que demuestre: usuario A no puede GET inscripción de usuario B.
4. Actualiza docs/seguridad y ADR en docs/arquitectura/06-decisiones-registro.md marcando ADR-003 como mitigado.

Criterios de aceptación: misma regla de visibilidad en listado y detalle; test verde; sin regresión en roster de coordinadora.
```

---

### Prompt 2 — CF-002 (Alta) — Minimizar logs (Semgrep blocking)

```text
Contexto: rc1/api/src/logger.js — política politicas-semgrep/log-minimizacion-email.yaml.

Problema: logConfirmation() escribe email completo y deskVerificationCode en stdout/LOG_PATH.

Tarea:
1. Redactar email (ej. primer carácter + *** + @dominio).
2. No loguear deskVerificationCode; usar solo registrationId + correlationId.
3. Volver a ejecutar: semgrep --config politicas-semgrep/log-minimizacion-email.yaml rc1/api/src
4. Alinear con docs/seguridad/05-errores-logging-auditoria.md (LOG-03, LOG-04).

Criterios de aceptación: Semgrep org 0 findings; logs siguen siendo correlacionables para soporte.
```

---

### Prompt 3 — CF-003 (Media) — Reducir exposición del código de verificación

```text
Contexto: POST /registrations en rc1/api/src/app.js devuelve deskVerificationCode en el JSON y también lo envía por mail simulado.

Tarea:
1. Eliminar deskVerificationCode del cuerpo de respuesta 201 (dejar solo toRegistrationDetail sin código).
2. Mantener el código solo en el canal correo (o solo en respuesta si el producto decide lo contrario — documentar decisión en ADR).
3. Actualizar frontend si mostraba el código desde la respuesta API.
4. Actualizar docs/funcional/03-flujos-principales.md.

Criterios de aceptación: un solo canal de entrega del código; UI sigue funcionando vía bandeja /correo.
```

---

### Prompt 4 — CF-004 (Media) — CSPRNG para código de mesa

```text
Contexto: rc1/api/src/confirmationToken.js usa Math.random().

Tarea:
1. Reemplazar por crypto.randomInt (Node crypto) o randomBytes con formato CF-XXXXXX y entropía suficiente.
2. Documentar en docs/seguridad/03-secretos-configuracion-criptografia.md si aplica.
3. No cambiar formato visible CF-XXXXXX salvo necesidad de producto.

Criterios de aceptación: sin Math.random() para secretos/códigos de verificación.
```

---

### Prompt 5 — CF-005 (Media) — Proteger servicio mail interno

```text
Contexto: rc1/mail/src/index.js — GET/POST/DELETE /messages sin auth; escucha 0.0.0.0:8025 en contenedor.

Tarea:
1. Añadir token compartido (header Authorization o X-Mail-Token) desde MAIL_INTERNAL_TOKEN en api y mail.
2. Rechazar peticiones sin token con 401.
3. Documentar variable en docs/arquitectura/04-despliegue-runtime.md y .env.example.
4. No publicar puerto 8025 al host salvo depuración (compose ya usa 127.0.0.1).

Criterios de aceptación: acceso directo a :8025 sin token imposible; API sigue enviando correo.
```

---

### Prompt 6 — CF-006 (Media) — Catálogo público vs autenticado

```text
Contexto: GET /activities no usa requireSession en app.js.

Tarea:
1. Decidir con producto: ¿catálogo público o solo autenticados?
2. Si debe ser privado, añadir requireSession a GET /activities (y ajustar UI si hoy carga antes de login).
3. Si permanece público, documentar excepción en docs/funcional/01-proposito-actores.md y riesgo residual en hallazgos.

Criterios de aceptación: decisión documentada; implementación coherente con matriz de permisos.
```

---

### Prompt 7 — CF-007 (Media) — Ciclo de vida de sesión

```text
Contexto: rc1/api/src/auth.js — express-session sin regenerate tras login; secure: false.

Tarea:
1. Tras login exitoso en POST /auth/login, llamar req.session.regenerate() antes de asignar actorId (patrón express-session).
2. Para producción documentada: cookie.secure = process.env.NODE_ENV === 'production' o TRUST_TLS=true.
3. Verificar docs/seguridad/01-autenticacion-identidad-sesiones.md (AUTH-SES-02).

Criterios de aceptación: regenerate en login; logout sigue destruyendo sesión.
```

---

### Prompt 8 — CF-008 (Media) — Rate limiting

```text
Contexto: API Express sin límites en /auth/login y POST /registrations.

Tarea:
1. Añadir rate limit (express-rate-limit o middleware equivalente) en /auth/login y rutas de escritura sensibles.
2. Documentar umbrales en docs/seguridad/02-autorizacion-control-accesos-apis.md (AUTHZ-API4-01).
3. Respuesta 429 con mensaje genérico y correlationId.

Criterios de aceptación: brute force local mitigado; tests smoke si existen.
```

---

### Prompt 9 — CF-009 (Baja) — Actualizar express-session

```text
Contexto: npm audit en rc1/api reporta LOW en on-headers vía express-session@1.18.1.

Tarea:
1. Actualizar express-session a >=1.19.0 (ver fixAvailable npm audit).
2. Ejecutar npm audit y tests smoke-auth si existen.
3. Registrar en plantillas/registro-escaneos.md.

Criterios de aceptación: npm audit api sin LOW pendientes o exención documentada.
```

---

### Prompt 10 — CF-010 (Baja) — IDs opacos (defensa en profundidad)

```text
Contexto: createRegistration genera id reg-${studentId}-...

Tarea:
1. Generar sufijo aleatorio opaco (uuid o randomBytes) manteniendo unicidad en BD.
2. Mantener autorización por objeto (Prompt 1) como control principal.
3. Actualizar docs/funcional/04-modelo-dominio.md.

Criterios de aceptación: IDs no derivables trivialmente del studentId.
```

---

### Prompt 11 — CF-011 (Informativo) — Secreto inerte en repo

```text
Contexto: Gitleaks alerta STRIPE_WEBHOOK_SECRET inerte en rc1/config/integraciones-pago.env.sample (intencional taller).

Tarea (elige una):
A) Dejar sample pero registrar exención GATE-02 en plantillas/hallazgos.md con justificación "lab inert".
B) Mover valor a docs-only y dejar sample solo con placeholder STRIPE_WEBHOOK_SECRET=<desde gestor de secretos>.

Criterios: gitleaks con política taller documentado en registro-escaneos; sin secretos reales.
```

---

### Prompt 12 — CF-012 / CF-DAST-001 / CF-DAST-002 — Post-DAST

```text
Contexto: DAST ejecutado 2026-10-22 (Nuclei 0 medium+; hallazgos manuales en plantillas/scan-output-headers-dast.txt).

Tarea CF-DAST-001 (mail):
1. En rc1/mail/src/index.js, envolver parsing de URL en try/catch; responder 400 sin tumbar el proceso.
2. Validar pathname con whitelist (/health, /messages).
3. Re-ejecutar nuclei contra :8025 y confirmar que el contenedor sigue healthy.

Tarea CF-DAST-002 (nginx):
1. Añadir en rc1/web/nginx.conf cabeceras: Content-Security-Policy (mínimo default-src 'self'), X-Frame-Options DENY o SAMEORIGIN, Permissions-Policy acotada.
2. HSTS solo si se documenta TLS; en lab HTTP omitir o usar max-age 0.

Tarea CF-012:
1. Registrar en plantillas/registro-escaneos.md comandos Nuclei y rutas a scan-output-*.txt.
2. Opcional: instalar ZAP y repetir baseline para comparar.

No probar contra infraestructura ajena al taller.
```

---

### Prompt 13 — CF-CONT-001 — Imágenes Docker (Trivy)

```text
Contexto: trivy image reporta 56–68 vulns HIGH/CRITICAL por imagen (SO base). Ver plantillas/scan-output-trivy-images.txt.

Tarea:
1. Actualizar digest de node:24-bookworm-slim y nginx:alpine a revisiones parcheadas cuando existan.
2. Rebuild: docker compose -f rc1/docker-compose.student.yml build --no-cache
3. Re-ejecutar trivy image; documentar CVEs residuales con exención GATE-02 si el taller lo permite.
4. Separar en reporte: CVEs de app (npm audit) vs CVEs de plataforma (Trivy OS).

Criterios: reducir CRITICAL en imágenes; no falsear quality gate en producción.
```

---

### Prompt maestro — Sprint de hardening (orden recomendado)

```text
Eres desarrollador de CampusFlow RC-1. Corrige hallazgos de seguridad en este orden:
1) IDOR GET /registrations/:id (CF-001)
2) Logging PII/códigos en logger.js (CF-002) — debe pasar Semgrep org
3) Quitar deskVerificationCode del JSON 201 (CF-003)
4) crypto.randomInt en confirmationToken.js (CF-004)
5) Token interno en servicio mail (CF-005)
6) session.regenerate en login (CF-007)
7) rate limit en login (CF-008)
8) npm audit fix express-session (CF-009)

Después de cada cambio: npm test en api si aplica, semgrep org, actualizar docs/ en docs/funcional y docs/seguridad según GUIA-AGENTES-DOCUMENTACION.md.
No cierres el sprint sin CF-001 y CF-002 resueltos.
```

---

## 6. Checklist de cierre DevSecOps

| Ítem | Completado en esta auditoría |
| --- | --- |
| Secret scan (Gitleaks) | Sí |
| SCA (`npm audit`) | Sí |
| SAST Semgrep org + auto | Sí |
| Skill `security-audit` (6 fases + JSON) | No — revisión estática equivalente |
| Trivy imagen | Sí (`scan-output-trivy-images.txt`) |
| Trivy FS | Sí (lockfile API) |
| DAST (Nuclei + manual) | Sí (`scan-output-nuclei-*.txt`, headers) |
| Stack Docker | Sí (`rc1/docker-compose.student.yml`) |
| Prompts para desarrollo | Sí (sección 5, incl. 13) |
| Hallazgos código prioritarios | CF-001, CF-002 |
| Archivos de evidencia | `plantillas/scan-output-*.txt` |

---

## 7. Referencias

- Pipeline: `docs/seguridad/06-auditoria-devsecops-pipeline.md`
- Skill agente: `docs/seguridad/07-auditoria-agente-security-audit.md`
- Contratos API: `docs/funcional/05-contratos-interfaces.md`
- Cloudflare security-audit-skill: https://github.com/cloudflare/security-audit-skill/

---

*Documento generado para entrega y lectura offline. Puede adjuntarse al dictamen del taller o compartirse con el equipo de desarrollo.*
