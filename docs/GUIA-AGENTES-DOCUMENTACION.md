# Guía para agentes — documentación obligatoria (Vibe Coding)

Esta guía aplica a **cualquier proyecto** generado o evolucionado con Vibe Coding. Los agentes **deben** mantener `docs/` como fuente de verdad para arquitectura, funcionalidad y seguridad.

---

## 1. Principios

| Principio | Descripción |
| --- | --- |
| **Single source of truth** | Si está en código, debe reflejarse en `docs/` (o enlazarse desde ahí). |
| **Audiencias múltiples** | Mismo hecho, distinto énfasis: arquitectura (cómo), funcional (qué/por qué), seguridad (controles). |
| **Incremental** | Actualizar en el mismo cambio de código; diffs pequeños y fechados. |
| **Genérico reutilizable** | Redactar para que otro repo pueda copiar la estructura; evitar jerga interna sin glosario. |
| **Trazabilidad** | ADRs para decisiones; IDs de requisito de seguridad al revisar PRs. |

---

## 2. Cuándo documentar (disparadores)

| Evento en código | Acción en `docs/` |
| --- | --- |
| Nuevo servicio, carpeta o capa | `arquitectura/03-estructura-modulos.md`, `02-stack-componentes.md` |
| Nuevo endpoint, pantalla o job | `funcional/02-capacidades-casos-uso.md`, `05-contratos-interfaces.md`, flujo en `03-flujos-principales.md` |
| Cambio Docker, env, puertos | `arquitectura/04-despliegue-runtime.md` |
| Nuevo modelo/tabla/campo | `funcional/04-modelo-dominio.md`, `arquitectura/05-datos-integraciones.md` |
| Auth, roles, permisos | `funcional/01-proposito-actores.md` + `seguridad/01` y `seguridad/02` |
| Secretos, cifrado, TLS | `seguridad/03` + nota en ADR si hay excepción de laboratorio |
| Validación, dependencias | `seguridad/04` |
| Logging, errores | `seguridad/05` + módulo en `arquitectura/03` |
| Escaneos de seguridad / CI / auditoría | `seguridad/06` + `seguridad/07` + skill `.agents/skills/security-audit/` + `plantillas/registro-escaneos.md` |
| Decisión difícil de revertir | Nueva entrada en `arquitectura/06-decisiones-registro.md` |

Si no aplica ningún archivo, crear sección bajo el doc más cercano **no** crear archivos sueltos en la raíz de `docs/`.

---

## 3. Qué escribe cada dominio

### Arquitectura (`docs/arquitectura/`)

- Stack, límites de módulos, diagramas lógicos (Mermaid permitido).
- Runtime: procesos, puertos, variables de entorno **nombradas** (sin valores secretos).
- Integraciones externas e internas (APIs, colas, BD).
- **No** repetir casos de uso completos (enlazar a `funcional/`).

### Funcional (`docs/funcional/`)

- Problema de negocio, actores, permisos desde la perspectiva del usuario.
- Casos de uso, flujos paso a paso, reglas de negocio.
- Contratos: rutas HTTP, eventos, CLI — tablas método/ruta/auth/descripción.
- **No** repetir políticas OWASP (enlazar a `seguridad/`).

### Seguridad (`docs/seguridad/`)

- Directivas **normativas** (DEBE / PROHIBIDO).
- Checklists por dominio; el agente cita IDs (`AUTHZ-IDOR-01`) en revisiones.
- Postura del **proyecto concreto**: sección «Estado en este repo» al final de cada doc de seguridad cuando haya gap conocido (opcional, recomendado en talleres).

---

## 4. Formato y metadatos

Al inicio de cada doc de proyecto (no en plantillas puras):

```markdown
| Campo | Valor |
| --- | --- |
| Proyecto | [nombre] |
| Última revisión doc | YYYY-MM-DD |
| Revisado por | agente / humano |
```

- Idioma: **español** salvo que el repo declare otro idioma en README.
- Diagramas: Mermaid en arquitectura y flujos cuando aclaren más que prosa.
- TODOs: `<!-- TODO(doc): descripción breve -->` hasta cerrar.

---

## 5. Flujo de trabajo del agente (checklist de cierre)

Antes de dar por terminada una tarea con cambios de código:

- [ ] ¿Cambié comportamiento visible o contratos? → `funcional/` actualizado
- [ ] ¿Cambié estructura, deps o despliegue? → `arquitectura/` actualizado
- [ ] ¿Toqué auth, datos sensibles, inputs, logs? → `seguridad/` revisado; gaps anotados
- [ ] ¿Decisión no obvia? → ADR en `06-decisiones-registro.md`
- [ ] ¿Enlaces rotos en `docs/README.md`? → corregir

---

## 6. Bootstrap de proyecto nuevo

1. Copiar `docs/plantillas/` → rellenar `arquitectura/` y `funcional/` desde plantillas.
2. Copiar `docs/seguridad/` intacto (directivas organizacionales).
3. Sustituir metadatos de proyecto en `docs/README.md`.
4. Añadir regla `.cursor/rules/documentacion-vibe-coding.mdc` (incluida en este repo).

---

## 7. Relación con Cursor

La regla **`documentacion-vibe-coding`** (`alwaysApply: true`) recuerda esta guía en cada sesión. El agente **lee** el doc de dominio relevante **antes** de implementar features transversales (auth, API, infra).
