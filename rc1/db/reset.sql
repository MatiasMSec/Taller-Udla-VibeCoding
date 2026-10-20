BEGIN;

ALTER TABLE actors ADD COLUMN IF NOT EXISTS password_hash TEXT;

TRUNCATE TABLE registrations, activities, actors RESTART IDENTITY CASCADE;

INSERT INTO actors (id, display_name, email, role, password_hash) VALUES
  ('ana', 'Ana Ejemplo', 'ana.ejemplo@campus.test', 'student', '$2a$10$1VQER/bKhUyg74neAEByf.IpnkTy.Y.6f/FQJ4VkMYhHc9mQHjfbu'),
  ('bruno', 'Bruno Ejemplo', 'bruno.ejemplo@campus.test', 'student', '$2a$10$AvGawV1imdlFJRg6h.mZeeK8hrO6lfDrgSApzHNjpJI/gsGR5ti1y'),
  ('camila', 'Camila Ejemplo', 'camila.ejemplo@campus.test', 'coordinator', '$2a$10$HzD4wfSUnFxgsKVXTdXJOuzZ6ueszpnxvHFlOOvR45bYmuKc0OZPa');

INSERT INTO activities (
  id, title, summary, campus, place, starts_at, capacity, coordinator_id, coordinator_label
) VALUES
  (
    'act-feria',
    'Feria de proyectos de primer año',
    'Los equipos muestran un prototipo en una mesa y conversan con docentes invitados. No es una evaluación: es una instancia para explicar qué problema eligieron y qué aprendieron al construirlo.',
    'Campus Norte (ficticio)',
    'Hall de talleres',
    '2026-11-12 11:00:00-03',
    40,
    'camila',
    'Camila Ejemplo'
  ),
  (
    'act-escritura',
    'Taller de escritura académica',
    'Una sesión corta para ordenar la introducción de un informe: pregunta, contexto y cierre. Cada participante trabaja sobre un texto propio de una página.',
    'Casa central (ficticia)',
    'Sala 3',
    '2026-10-28 16:30:00-03',
    25,
    NULL,
    'Equipo de vida universitaria'
  ),
  (
    'act-coro',
    'Ensayo abierto del coro',
    'El coro ensaya un repertorio de primavera y deja cupos para quienes quieran escuchar o sumarse por esta vez. No hace falta experiencia previa.',
    'Casa central (ficticia)',
    'Auditorio menor',
    '2026-11-04 18:00:00-03',
    60,
    NULL,
    'Equipo de vida universitaria'
  ),
  (
    'act-huerta',
    'Jornada de huerta universitaria',
    'Trabajo práctico al aire libre: almácigos, riego y registro de lo que ya está creciendo en los cajones del patio. Conviene llevar ropa que pueda ensuciarse.',
    'Campus Norte (ficticio)',
    'Patio de los cajones',
    '2026-11-08 10:00:00-03',
    20,
    NULL,
    'Equipo de vida universitaria'
  ),
  (
    'act-clinica',
    'Clínica breve de currículum',
    'Revisión de una página del currículum con una pauta simple: datos de contacto, experiencia y un logro verificable. Hay que traer el documento en un archivo propio.',
    'Casa central (ficticia)',
    'Box 2',
    '2026-11-18 15:00:00-03',
    15,
    'camila',
    'Camila Ejemplo'
  );

INSERT INTO registrations (id, activity_id, student_id, status, created_at) VALUES
  ('reg-ana-feria', 'act-feria', 'ana', 'confirmada', '2026-10-01 09:00:00-03'),
  ('reg-bruno-escritura', 'act-escritura', 'bruno', 'confirmada', '2026-10-02 09:30:00-03');

COMMIT;
