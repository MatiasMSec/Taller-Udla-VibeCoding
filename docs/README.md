# Documentación del proyecto — índice maestro

Punto de entrada único para **arquitectura**, **funcionalidad** y **seguridad**. Pensado para equipos de arquitectura, desarrollo y ciberseguridad, y para **agentes de Vibe Coding** que mantienen el repo al día.

## Cómo usar este árbol

| Audiencia | Empieza por |
| --- | --- |
| Arquitectura / DevOps | [arquitectura/README.md](./arquitectura/README.md) |
| Desarrollo / Producto | [funcional/README.md](./funcional/README.md) |
| Ciberseguridad / Auditoría | [seguridad/README.md](./seguridad/README.md) |
| Agentes IA | [GUIA-AGENTES-DOCUMENTACION.md](./GUIA-AGENTES-DOCUMENTACION.md) |

## Estructura

```
docs/
├── README.md                          ← Este índice
├── GUIA-AGENTES-DOCUMENTACION.md      ← Obligaciones de documentación (Vibe Coding)
├── arquitectura/                      ← Cómo está construido y desplegado
├── funcional/                         ← Qué hace el producto y para quién
├── seguridad/                         ← Directivas obligatorias (OWASP, NIST, ISO)
└── plantillas/                        ← Esqueletos para proyectos nuevos
```

## Reglas rápidas para agentes

1. **Código nuevo o cambio de comportamiento** → actualizar el doc funcional y/o arquitectura afectado el mismo turno (no al final).
2. **Endpoint, auth, secretos, logs** → revisar [seguridad/](./seguridad/) y documentar excepciones en [arquitectura/06-decisiones-registro.md](./arquitectura/06-decisiones-registro.md).
3. **No duplicar**: hechos estables viven en un solo doc; el resto enlaza.
4. Marcar secciones incompletas con `<!-- TODO(doc): ... -->` y resolverlas antes de cerrar la tarea.

## Mapa transversal (seguridad ↔ diseño)

| Tema | Arquitectura | Funcional | Seguridad |
| --- | --- | --- | --- |
| Login / sesión | [04-despliegue-runtime.md](./arquitectura/04-despliegue-runtime.md) | [03-flujos-principales.md](./funcional/03-flujos-principales.md) | [seguridad/01-…](./seguridad/01-autenticacion-identidad-sesiones.md) |
| APIs | [05-datos-integraciones.md](./arquitectura/05-datos-integraciones.md) | [05-contratos-interfaces.md](./funcional/05-contratos-interfaces.md) | [seguridad/02-…](./seguridad/02-autorizacion-control-accesos-apis.md) |
| Secretos / TLS | [04-despliegue-runtime.md](./arquitectura/04-despliegue-runtime.md) | — | [seguridad/03-…](./seguridad/03-secretos-configuracion-criptografia.md) |
| PII en logs | [03-estructura-modulos.md](./arquitectura/03-estructura-modulos.md) | — | [seguridad/05-…](./seguridad/05-errores-logging-auditoria.md) |
| Pipeline de auditoría (SCA/SAST/DAST) | [04-despliegue-runtime.md](./arquitectura/04-despliegue-runtime.md) | — | [seguridad/06-…](./seguridad/06-auditoria-devsecops-pipeline.md) |
| Auditoría agente (Cloudflare skill) | — | — | [seguridad/07-…](./seguridad/07-auditoria-agente-security-audit.md) |

## Proyecto actual

**CampusFlow · RC-1** — laboratorio estudiantil de inscripciones (ficticio, solo `127.0.0.1`). Detalle en [arquitectura/01-vision-contexto.md](./arquitectura/01-vision-contexto.md) y [funcional/01-proposito-actores.md](./funcional/01-proposito-actores.md).
