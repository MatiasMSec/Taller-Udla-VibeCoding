# 01 — Propósito y actores

| Campo | Valor |
| --- | --- |
| Proyecto | CampusFlow · RC-1 |
| Última revisión doc | 2026-10-22 |

## Propósito de negocio (ficticio)

Permitir a la comunidad universitaria **descubrir actividades** de vida universitaria, **reservar cupos** limitados y **recibir confirmación** por correo simulado, mientras las **coordinadoras** revisan quién se inscribió en sus actividades.

## Actores

| Actor | Identificación | Objetivos |
| --- | --- | --- |
| **Estudiante** | Rol `student` | Ver actividades, inscribirse, ver sus cupos y confirmaciones |
| **Coordinadora** | Rol `coordinator` | Ver actividades, roster de inscripciones en actividades que coordina, bandeja filtrada |
| **Visitante no autenticado** | Sin sesión | Solo puede usar API pública de catálogo (`GET /activities`) si conoce la URL; la UI exige login |

## Matriz funcional de permisos (intención de diseño)

| Acción | Estudiante | Coordinadora | Anónimo |
| --- | --- | --- | --- |
| Listar actividades (API) | Sí | Sí | Sí |
| Detalle actividad + roster | Sí (roster filtrado) | Sí (solo sus actividades) | No (UI) / Sí con sesión (API) |
| Crear inscripción | Sí | No | No |
| Listar inscripciones propias / a cargo | Sí / — | — / Sí | No |
| Ver detalle inscripción por ID | **Debería:** solo propias / a cargo — **RC-1:** gap (ver contratos) | Idem | No |
| Bandeja confirmaciones | Propios emails | Mensajes ligados a inscripciones visibles | No |

Seguridad normativa: [../seguridad/02-autorizacion-control-accesos-apis.md](../seguridad/02-autorizacion-control-accesos-apis.md).

## Cuentas de demostración

Seed en BD (`ana`, `bruno`, `camila`); contraseñas las entrega el docente en el taller (hashes en SQL, no plaintext en repo).
