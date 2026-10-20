const REGISTRATION_SQL = `
  SELECT r.id, r.status, r.created_at,
         s.id AS student_id, s.display_name AS student_name, s.email AS student_email,
         a.id AS activity_id, a.title AS activity_title, a.summary AS activity_summary,
         a.campus, a.place, a.starts_at, a.capacity, a.coordinator_id, a.coordinator_label
  FROM registrations r
  JOIN actors s ON s.id = r.student_id
  JOIN activities a ON a.id = r.activity_id
`;

export async function getActor(pool, actorId) {
  const { rows } = await pool.query(
    'SELECT id, display_name, email, role FROM actors WHERE id = $1',
    [actorId]
  );
  return rows[0] || null;
}

export async function findActorForLogin(pool, login) {
  const { rows } = await pool.query(
    'SELECT id, display_name, email, role, password_hash FROM actors WHERE id = $1',
    [login]
  );
  return rows[0] || null;
}

export async function listActivities(pool) {
  const { rows } = await pool.query(`
    SELECT a.id, a.title, a.summary, a.campus, a.place, a.starts_at, a.capacity,
           a.coordinator_label,
           (SELECT count(*)::int FROM registrations r WHERE r.activity_id = a.id) AS taken
    FROM activities a
    ORDER BY a.starts_at
  `);
  return rows;
}

export async function findActivity(pool, activityId) {
  const { rows } = await pool.query(
    `SELECT a.id, a.title, a.summary, a.campus, a.place, a.starts_at, a.capacity,
            a.coordinator_id, a.coordinator_label,
            (SELECT count(*)::int FROM registrations r WHERE r.activity_id = a.id) AS taken
     FROM activities a
     WHERE a.id = $1`,
    [activityId]
  );
  return rows[0] || null;
}

export async function listVisibleRegistrations(pool, actor) {
  const { rows } = await pool.query(
    `${REGISTRATION_SQL}
     WHERE ($1 = 'student' AND r.student_id = $2)
        OR ($1 = 'coordinator' AND a.coordinator_id = $2)
     ORDER BY a.starts_at, r.created_at`,
    [actor.role, actor.id]
  );
  return rows;
}

export async function visibleRegistrationIds(pool, actor) {
  const rows = await listVisibleRegistrations(pool, actor);
  return new Set(rows.map((row) => row.id));
}

export async function findRegistration(pool, registrationId) {
  const { rows } = await pool.query(`${REGISTRATION_SQL} WHERE r.id = $1`, [registrationId]);
  return rows[0] || null;
}

export async function createRegistration(pool, { activityId, studentId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const activity = await client.query(
      `SELECT id, title, capacity FROM activities WHERE id = $1 FOR UPDATE`,
      [activityId]
    );
    if (!activity.rows[0]) {
      await client.query('ROLLBACK');
      return { error: 'missing' };
    }
    const count = await client.query(
      'SELECT count(*)::int AS taken FROM registrations WHERE activity_id = $1',
      [activityId]
    );
    if (count.rows[0].taken >= activity.rows[0].capacity) {
      await client.query('ROLLBACK');
      return { error: 'full' };
    }
    const id = `reg-${studentId}-${activityId.replace(/^act-/, '')}`;
    const inserted = await client.query(
      `INSERT INTO registrations (id, activity_id, student_id, status)
       VALUES ($1, $2, $3, 'confirmada')
       ON CONFLICT (activity_id, student_id) DO NOTHING
       RETURNING id`,
      [id, activityId, studentId]
    );
    if (!inserted.rows[0]) {
      await client.query('ROLLBACK');
      return { error: 'duplicate' };
    }
    await client.query('COMMIT');
    return { registration: await findRegistration(pool, id) };
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // La conexión ya cerró la transacción.
    }
    throw error;
  } finally {
    client.release();
  }
}

export function filterMessages(actor, messages, visibleIds) {
  return messages.filter((message) => {
    if (actor.role === 'student') return message.to === actor.email;
    return Boolean(message.registrationId && visibleIds.has(message.registrationId));
  });
}
