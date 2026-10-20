import { useEffect, useState } from 'react';
import { api, formatWhen, seatsLeft } from './api.js';

function Message({ kind = 'info', children }) {
  return <p className={`message is-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>{children}</p>;
}

function Empty({ title, children }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}

export function ActivitiesPage({ go }) {
  const [activities, setActivities] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/activities')
      .then((data) => setActivities(data.activities))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <p className="kicker">Vida universitaria</p>
      <h1>Actividades abiertas</h1>
      <p className="lede">Revisa de qué se trata cada instancia y guarda un cupo si participas como estudiante.</p>
      {error && <Message kind="error">{error}</Message>}
      {activities && activities.length === 0 && (
        <Empty title="No hay actividades publicadas">Cuando el equipo de vida universitaria abra una convocatoria, aparecerá en esta página.</Empty>
      )}
      <div className="cards">
        {activities?.map((activity) => (
          <article className="card" key={activity.id}>
            <p className="kicker">{activity.campus}</p>
            <h2>{activity.title}</h2>
            <p>{activity.summary}</p>
            <dl>
              <div><dt>Cuándo</dt><dd>{formatWhen(activity.startsAt)}</dd></div>
              <div><dt>Dónde</dt><dd>{activity.place}</dd></div>
              <div><dt>Cupos</dt><dd>{seatsLeft(activity)} disponibles de {activity.capacity}</dd></div>
            </dl>
            <button className="button" type="button" onClick={() => go(`/actividades/${activity.id}`)}>
              Ver actividad
            </button>
          </article>
        ))}
      </div>
    </>
  );
}

export function ActivityPage({ user, go, activityId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);

  function load() {
    setError('');
    return api(`/activities/${activityId}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, [activityId]);

  async function enroll() {
    setPending(true);
    setNotice('');
    setError('');
    try {
      const result = await api('/registrations', {
        method: 'POST',
        body: { activityId }
      });
      setNotice('Quedaste inscrita o inscrito. La confirmación está en la bandeja local.');
      await load();
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  if (error && !data) return <Message kind="error">{error}</Message>;
  if (!data) return <p className="loading">Cargando la actividad…</p>;

  const { activity, roster } = data;
  const mine = roster.find((item) => item.student.id === user.id);
  const remaining = seatsLeft(activity);

  return (
    <>
      <button className="text-link" type="button" onClick={() => go('/')}>Volver a actividades</button>
      <p className="kicker">{activity.campus}</p>
      <h1>{activity.title}</h1>
      <p className="lede">{activity.summary}</p>
      <section className="panel facts">
        <div><span>Cuándo</span><strong>{formatWhen(activity.startsAt)}</strong></div>
        <div><span>Lugar</span><strong>{activity.place}</strong></div>
        <div><span>Coordinación</span><strong>{activity.coordinatorLabel}</strong></div>
        <div><span>Cupos</span><strong>{remaining} de {activity.capacity}</strong></div>
      </section>
      {notice && <Message kind="ok">{notice} <button className="text-link" type="button" onClick={() => go('/correo')}>Ver confirmación</button></Message>}
      {error && <Message kind="error">{error}</Message>}
      {user.role === 'student' && (
        mine ? (
          <button className="button" type="button" onClick={() => go(`/inscripciones/${mine.id}`)}>Ver mi inscripción</button>
        ) : (
          <button className="button" type="button" onClick={enroll} disabled={pending || remaining === 0}>
            {remaining === 0 ? 'Sin cupos' : pending ? 'Guardando…' : 'Inscribirme'}
          </button>
        )
      )}
      {user.role === 'coordinator' && (
        <section className="roster">
          <h2>Inscripciones de esta actividad</h2>
          {roster.length === 0 ? (
            <Empty title="Todavía no hay inscripciones">Cuando un estudiante reserve cupo, el nombre aparecerá en esta lista.</Empty>
          ) : (
            <ul className="roster-list">
              {roster.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.student.displayName}</strong>
                    <span>Confirmada · {formatWhen(item.createdAt)}</span>
                  </div>
                  <button className="button button-secondary" type="button" onClick={() => go(`/inscripciones/${item.id}`)}>
                    Abrir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}

export function RegistrationsPage({ user, go }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setItems(null);
    api('/registrations')
      .then((data) => setItems(data.registrations))
      .catch((err) => setError(err.message));
  }, [user.id]);

  const title = user.role === 'coordinator' ? 'Inscripciones a tu cargo' : 'Tus inscripciones';

  return (
    <>
      <p className="kicker">{user.displayName}</p>
      <h1>{title}</h1>
      <p className="lede">
        {user.role === 'coordinator'
          ? 'Aquí aparecen las personas inscritas en las actividades que coordinas.'
          : 'Aquí aparecen solo las actividades en las que reservaste cupo.'}
      </p>
      {error && <Message kind="error">{error}</Message>}
      {items && items.length === 0 && (
        <Empty title="No hay inscripciones para mostrar">
          {user.role === 'coordinator'
            ? 'Ningún estudiante se ha inscrito todavía en tus actividades.'
            : 'Cuando te inscribas, el cupo quedará listado en esta página.'}
        </Empty>
      )}
      <ul className="plain-list">
        {items?.map((item) => (
          <li key={item.id}>
            <div>
              <p className="kicker">{item.status}</p>
              <h2>{item.activity.title}</h2>
              <p>{item.student.displayName} · {formatWhen(item.activity.startsAt)}</p>
            </div>
            <button className="button button-secondary" type="button" onClick={() => go(`/inscripciones/${item.id}`)}>
              Ver detalle
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export function DetailPage({ go, registrationId }) {
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setItem(null);
    setError('');
    api(`/registrations/${registrationId}`)
      .then((data) => setItem(data.registration))
      .catch((err) => setError(err.message));
  }, [registrationId]);

  return (
    <>
      <button className="text-link" type="button" onClick={() => go('/inscripciones')}>Volver al listado</button>
      <p className="kicker">Inscripción</p>
      <h1>Detalle del cupo</h1>
      {error && <Message kind="error">{error}</Message>}
      {!error && !item && <p className="loading">Cargando la inscripción…</p>}
      {item && (
        <article className="panel detail">
          <p className="status">{item.status}</p>
          <h2>{item.activity.title}</h2>
          <p>{item.activity.summary}</p>
          <dl>
            <div><dt>Participante</dt><dd>{item.student.displayName}</dd></div>
            <div><dt>Confirmación enviada a</dt><dd>{item.student.email}</dd></div>
            <div><dt>Cuándo</dt><dd>{formatWhen(item.activity.startsAt)}</dd></div>
            <div><dt>Lugar</dt><dd>{item.activity.place}, {item.activity.campus}</dd></div>
            <div><dt>Coordinación</dt><dd>{item.activity.coordinatorLabel}</dd></div>
          </dl>
          <p className="note">{item.confirmation}</p>
          <button className="button button-secondary" type="button" onClick={() => go('/correo')}>Abrir la bandeja</button>
        </article>
      )}
    </>
  );
}

export function MailPage() {
  const [mailbox, setMailbox] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setMailbox(null);
    api('/messages')
      .then(setMailbox)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <p className="kicker">Bandeja local</p>
      <h1>Confirmaciones</h1>
      <p className="lede">Estos mensajes se guardan en el proveedor simulado de este equipo. No salen a Internet.</p>
      {mailbox?.notice && <Message>{mailbox.notice}</Message>}
      {error && <Message kind="error">{error}</Message>}
      {mailbox && mailbox.messages.length === 0 && (
        <Empty title="No hay confirmaciones">Cuando reserves un cupo, el mensaje aparecerá en esta bandeja.</Empty>
      )}
      <ul className="mail-list">
        {mailbox?.messages.map((message) => (
          <li key={message.id}>
            <p className="kicker">{formatWhen(message.createdAt)}</p>
            <h2>{message.subject}</h2>
            <p className="mail-to">Para {message.to}</p>
            <p>{message.text}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
