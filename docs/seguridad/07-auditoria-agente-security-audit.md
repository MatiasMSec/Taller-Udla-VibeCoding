# 07 — Auditoría multi-fase con agente (`security-audit`)

**Alcance:** proceso **obligatorio para agentes** dentro del pipeline DevSecOps, complementario a herramientas batch (Gitleaks, Semgrep, Trivy, ZAP).

| Campo | Valor |
| --- | --- |
| Skill | [Cloudflare security-audit-skill](https://github.com/cloudflare/security-audit-skill) |
| Ruta en repo | `.agents/skills/security-audit/` |
| Entrada | `SKILL.md` |
| Regla Cursor | `.cursor/rules/security-audit-skill-mandatorio.mdc` |
| Lock de versión | `skills-lock.json` |

---

## Objetivo

Orquestar auditorías en **seis fases** con hallazgos verificables y formato machine-readable (`findings.json`, `coverage-ledger.json`), validación **adversaria** (quien verifica ≠ quien caza) y reportes derivados (`REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`).

Referencia de diseño: [Build your own vulnerability harness](https://blog.cloudflare.com/) (citado en el README upstream del skill).

---

## Mandato para agentes (SCAN-AGENT-01)

| ID | Requisito |
| --- | --- |
| SCAN-AGENT-01 | Antes de cerrar una tarea **DevSecOps** o una **auditoría de código**, el agente **debe** cargar y seguir `.agents/skills/security-audit/SKILL.md` en **modo auditoría completa**, salvo que el usuario limite explícitamente a «solo lectura» o «sin artefactos». |
| SCAN-AGENT-02 | Ejecutar `validate-coverage-ledger.cjs` tras crear/actualizar el ledger; `validate-findings.cjs` en fase 4 y tras reemplazos en fase 5. |
| SCAN-AGENT-03 | No promover a `confirmed` sin traza en código y resultado acotado; usar `needs_validation` si falta sandbox o evidencia decisiva. |
| SCAN-AGENT-04 | Registrar en el taller: `plantillas/registro-escaneos.md` (ejecución) y `plantillas/hallazgos.md` (hallazgos accionables). |
| SCAN-AGENT-05 | Reutilizar `docs/arquitectura/*` y `docs/funcional/*` como contexto en reconocimiento; actualizar docs si la auditoría revela desvíos. |

---

## Fases (resumen)

1. **Reconocimiento** — `architecture.md`, `coverage-ledger.json` (mapa de superficies y unidades de cobertura).
2. **Caza guiada por cobertura** — hunters aislados; clases en `ATTACK-CLASSES.md` y módulos temáticos (web, cliente, cloud, supply chain, etc.).
3. **Validación de candidatos** — verificador fresco intenta refutar.
4. **Salida estructurada** — `findings.json` según `report-schema.json`.
5. **Verificación independiente de registros** — agentes distintos revisan claims finales.
6. **Reporting neutral** — markdown derivado de registros verificados.

Detalle operativo: archivos en `.agents/skills/security-audit/` (`RECONNAISSANCE.md`, `HUNTING.md`, `VALIDATION-AND-REPORTING.md`).

---

## Clases de ataque recomendadas (CampusFlow RC-1)

| Módulo skill | Motivo en este repo |
| --- | --- |
| `WEB-PROTOCOL-AND-AUTH.md` | Express, sesiones, cookies, API REST |
| `CLIENT-SIDE.md` | React SPA, routing cliente |
| `CLOUD-AND-DEPLOYMENT.md` | Docker Compose, nginx, bind localhost |
| `SUPPLY-CHAIN-AND-RELEASE.md` | npm lockfiles, imágenes base |
| `DATA-ISOLATION-AND-LIFECYCLE.md` | Multi-actor (student/coordinator), filtrado de datos |

---

## Directorio de salida

- **Por defecto (skill):** `~/security-audit-skill/<nombre-repo>/run-<N>/` (preferido, fuera de Git).
- **En repo (solo si ignorado):** `.security-audit/run-<N>/` — ver `.gitignore`.

No commitear `findings.json` con datos sensibles de entornos reales.

---

## Instalación / actualización

```bash
npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit
```

Verificar hash en `skills-lock.json` tras actualizar.

---

## Relación con pipeline 06

Orden para **agentes**:

1. Secret scanning  
2. SCA + SAST (paralelo)  
3. **Skill security-audit (este documento)**  
4. Container / IaC scan  
5. DAST / API security  

Ver [06-auditoria-devsecops-pipeline.md](./06-auditoria-devsecops-pipeline.md).
