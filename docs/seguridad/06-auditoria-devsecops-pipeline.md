# 06 — Proceso y pipeline de auditoría de seguridad (DevSecOps)

**Alcance:** fases, herramientas y quality gates para auditorías **automatizadas y manuales** en el SDLC: Secret Scanning, SCA, SAST, **auditoría multi-fase con agente (Cloudflare `security-audit`)**, Container Security, API Security y DAST.

**Referencias cruzadas:** secretos en código → [03-secretos-configuracion-criptografia.md](./03-secretos-configuracion-criptografia.md); SCA en deps → [04-validacion-entradas-integridad.md](./04-validacion-entradas-integridad.md); registro de escaneos del taller → `plantillas/registro-escaneos.md` y README del repo.

---

## 1. Descubrimiento de secretos (Secret Scanning)

**Objetivo:** Evitar filtración de credenciales, claves API, tokens JWT, certificados o claves privadas en el repositorio y en el historial de Git.

**Herramientas de referencia:** Gitleaks, TruffleHog, GitHub Secret Scanning.

### Directrices obligatorias

| ID | Requisito |
| --- | --- |
| SCAN-SEC-01 | Ningún secreto, contraseña o token **hardcodeado** en código fuente versionado. |
| SCAN-SEC-02 | Usar variables de entorno (`.env` local, gestor de secretos en prod) **validadas en runtime**. |
| SCAN-SEC-03 | Configurar **pre-commit hooks** que bloqueen commits con patrones de credenciales antes del remoto. |
| SCAN-SEC-04 | Ejecutar secret scanning en **CI** y registrar salida (aunque sea vacía) en el registro de escaneos del proyecto. |

### En este repo (CampusFlow RC-1)

- Política Gitleaks: `.gitleaks.toml`
- Comandos orientativos: README raíz (`gitleaks detect`, `--config .gitleaks.toml`)

---

## 2. Análisis de composición de software (SCA)

**Objetivo:** Detectar CVEs en dependencias directas/transitivas y revisar licencias OSS.

**Herramientas de referencia:** Trivy, Grype, Snyk; en Node: `npm audit`.

### Directrices obligatorias

| ID | Requisito |
| --- | --- |
| SCAN-SCA-01 | Ejecutar SCA en **cada PR** y en builds principales de CI/CD. |
| SCAN-SCA-02 | **Quality gate:** no fusionar a producción con vulns **Críticas** o **Altas** (CVSS ≥ 7.0) sin parche o **exención documentada** en registro de riesgos. |
| SCAN-SCA-03 | Mantener lockfiles actualizados (`package-lock.json`, `poetry.lock`, `go.sum`, etc.). |

### En este repo

- `npm audit` en `rc1/api/` y `rc1/web/` (ver README).

---

## 3. Análisis estático de código (SAST)

**Objetivo:** Detectar fallos sin ejecutar la app: inyecciones (SQLi, XSS), criptografía débil, patrones inseguros.

**Herramientas de referencia:** Semgrep, CodeQL, SonarQube; linters por lenguaje (Bandit, Gosec).

### Directrices obligatorias

| ID | Requisito |
| --- | --- |
| SCAN-SAST-01 | Reglas alineadas a **OWASP Top 10** y **CWE Top 25**; reglas **organizacionales** en repo cuando existan. |
| SCAN-SAST-02 | Validar sanitización/validación de entradas en **todas las capas**. |
| SCAN-SAST-03 | Revisar controladores, servicios y acceso a BD (consultas parametrizadas, autorización). |

### En este repo

- Semgrep org: `politicas-semgrep/log-minimizacion-email.yaml` sobre `rc1/api/src`
- Comparación: `semgrep --config auto rc1/api/src`

---

## 4. Seguridad de contenedores (Container Security)

**Objetivo:** Imágenes Docker e IaC (Kubernetes, Helm, Terraform) sin vulns de SO base ni mala configuración.

**Herramientas de referencia:** Trivy, Hadolint (Dockerfile), Checkov / KICS (IaC).

### Directrices obligatorias

| ID | Requisito |
| --- | --- |
| SCAN-CTR-01 | Imágenes base **oficiales y minimalistas** (Alpine, Distroless, Slim) con tags/digest mantenidos. |
| SCAN-CTR-02 | **No ejecutar como root** en runtime cuando sea posible (`USER` en Dockerfile). |
| SCAN-CTR-03 | Escanear FS de imagen (paquetes APT/APK/YUM) **antes** de publicar al registro. |

### En este repo

- Dockerfiles en `rc1/api/`, `rc1/web/`, `rc1/mail/`; API corre como usuario `node`.
- Trivy sobre imágenes locales si está instalado (README).

---

## 5. Seguridad de APIs y pruebas dinámicas (API Security & DAST)

**Objetivo:** Evaluar la aplicación **en ejecución** (caja negra/gris) y validar contratos de API.

**Herramientas de referencia:** OWASP ZAP, Nuclei, Schemathesis.

### Directrices obligatorias

| ID | Requisito |
| --- | --- |
| SCAN-API-01 | APIs expuestas: documentación **OpenAPI/Swagger** verificada contra **OWASP API Security Top 10**. |
| SCAN-API-02 | Controles: exceso de exposición de datos, límites de recursos, BOLA/BFLA (ver [02-autorizacion-control-accesos-apis.md](./02-autorizacion-control-accesos-apis.md)). |
| SCAN-DAST-01 | DAST en **staging** o pre-prod: cabeceras (CORS, HSTS, CSP), sesiones, broken access control. |

### En este repo

- Contratos funcionales: [../funcional/05-contratos-interfaces.md](../funcional/05-contratos-interfaces.md)
- Laboratorio local `127.0.0.1:8080` — DAST solo en entorno autorizado del taller.

---

## 6. Auditoría con agente — skill `security-audit` (mandatorio para agentes)

**Objetivo:** Caza de vulnerabilidades con cobertura ledger, verificación adversaria y salida `findings.json` validada.

**Skill:** [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) · ruta local `.agents/skills/security-audit/`.

| ID | Requisito |
| --- | --- |
| SCAN-AGENT-01 | Los **agentes** deben ejecutar el workflow completo del `SKILL.md` al cerrar tareas DevSecOps o auditorías de código (ver [07-auditoria-agente-security-audit.md](./07-auditoria-agente-security-audit.md)). |
| SCAN-AGENT-02 | Validar artefactos con `validate-coverage-ledger.cjs` y `validate-findings.cjs`. |
| SCAN-AGENT-03 | Integrar hallazgos con `plantillas/hallazgos.md` y directivas `docs/seguridad/01`–`05`. |

---

## 7. Automatización y puertas de calidad (Security Gates)

### Orden estricto en pipeline CI/CD y agentes

1. **Secret Scanning** — bloqueo inmediato ante hallazgos.
2. **SCA y SAST** — en paralelo por PR.
3. **Auditoría agente (`security-audit`)** — obligatoria para agentes; recomendada en release/hardening.
4. **Container e IaC Scanning** — fase de construcción de artefactos.
5. **DAST / API Security** — entornos efímeros previos a despliegue.

### Criterio general de aceptación

| ID | Requisito |
| --- | --- |
| GATE-01 | **Cero** vulnerabilidades **críticas o altas** sin mitigar, salvo **exención formal** en registro de riesgos del proyecto (ADR o plantilla de hallazgos). |
| GATE-02 | Toda exención incluye: CVE/hallazgo, justificación, compensación, fecha de revisión, responsable. |

---

## Checklist para agentes (auditoría o entrega)

- [ ] Secret scan ejecutado y registrado
- [ ] SCA (`npm audit` / equivalente) en módulos tocados
- [ ] SAST (Semgrep u otro) con reglas org si aplican
- [ ] **Skill `security-audit`** — 6 fases, validadores Node, artefactos en directorio de run
- [ ] Imágenes Docker revisadas (usuario no root, scan si hay herramienta)
- [ ] API/DAST planificado o ejecutado en entorno de prueba cuando el cambio es expuesto
- [ ] Hallazgos críticos/altos: parche, exención documentada o issue trazable

---

## Relación con otros documentos

- Diseño seguro: [01](./01-autenticacion-identidad-sesiones.md)–[05](./05-errores-logging-auditoria.md)
- Documentación de arquitectura/despliegue: [../arquitectura/04-despliegue-runtime.md](../arquitectura/04-despliegue-runtime.md)
- Guía agentes: [../GUIA-AGENTES-DOCUMENTACION.md](../GUIA-AGENTES-DOCUMENTACION.md)
- Skill agente: [07-auditoria-agente-security-audit.md](./07-auditoria-agente-security-audit.md)
