# 02 — Capacidades y casos de uso

| Campo | Valor |
| --- | --- |
| Proyecto | CampusFlow · RC-1 |
| Última revisión doc | 2026-10-22 |

## Capacidades del producto

| ID | Capacidad | Descripción breve |
| --- | --- | --- |
| CAP-01 | Catálogo de actividades | Listado con cupos, campus, fecha |
| CAP-02 | Detalle y roster | Vista de actividad e inscritos visibles para el rol |
| CAP-03 | Inscripción con cupo | Reserva transaccional con límite de capacity |
| CAP-04 | Confirmación por correo | Mensaje en bandeja local + código verificación mesa |
| CAP-05 | Mis inscripciones / a cargo | Listados filtrados por rol |
| CAP-06 | Detalle de inscripción | Datos participante, actividad, confirmación |
| CAP-07 | Bandeja de confirmaciones | Lectura de mensajes simulados filtrados |
| CAP-08 | Sesión | Login, perfil actual, logout |

## Casos de uso

### CU-01 — Iniciar sesión

- **Actor:** Estudiante o coordinadora.
- **Precondición:** Cuenta existente en BD.
- **Flujo principal:** Usuario y contraseña → sesión → redirección implícita a actividades.
- **Postcondición:** Cookie de sesión válida.
- **Excepción:** Credenciales inválidas → 401 mensaje genérico.

### CU-02 — Inscribirse en actividad

- **Actor:** Estudiante.
- **Precondición:** Sesión activa, cupos disponibles, no inscrito previamente.
- **Flujo:** Elegir actividad → Inscribirme → correo + log + respuesta 201.
- **Excepciones:** 409 cupo lleno o duplicado; 403 si no es estudiante.

### CU-03 — Revisar inscripciones coordinadas

- **Actor:** Coordinadora.
- **Precondición:** Actividades con `coordinator_id` igual al actor.
- **Flujo:** Menú inscripciones a cargo → listado → abrir detalle desde roster.

### CU-04 — Consultar confirmaciones

- **Actor:** Autenticado.
- **Flujo:** Menú Confirmaciones → API agrega mensajes del mail simulado filtrados.

<!-- TODO(doc): añadir CU cuando se incorporen nuevas pantallas o RC-2 -->
