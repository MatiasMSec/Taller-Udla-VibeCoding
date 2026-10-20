import express from 'express';
import { randomUUID } from 'node:crypto';
import { HttpError } from './errors.js';
import {
  requireSession,
  sessionMiddleware,
  toPublicUser,
  verifyCredentials
} from './auth.js';
import {
  listActivities,
  findActivity,
  listVisibleRegistrations,
  visibleRegistrationIds,
  createRegistration,
  filterMessages
} from './db.js';
import { sendMail, listMail } from './mailer.js';
import { logConfirmation } from './logger.js';
import { toActivity, toRegistrationListItem, toRegistrationDetail } from './present.js';
import { readRegistration } from './getRegistration.js';
import { createConfirmationToken } from './confirmationToken.js';

const ACTIVITY_ID = /^act-[a-z0-9-]{3,48}$/;
const REGISTRATION_ID = /^reg-[a-z0-9-]{3,48}$/;

function asyncRoute(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function createApp({ pool, release, sessionSecret }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '16kb' }));
  app.use(sessionMiddleware(sessionSecret));
  app.use((req, res, next) => {
    const incoming = req.get('x-correlation-id') || '';
    req.correlationId = /^[A-Za-z0-9-]{8,80}$/.test(incoming) ? incoming : randomUUID();
    res.setHeader('X-Correlation-Id', req.correlationId);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'campusflow', release });
  });

  app.get('/meta', (_req, res) => {
    res.json({
      service: 'campusflow',
      release,
      environment: 'laboratorio-local',
      mail: 'simulado-local'
    });
  });

  app.post('/auth/login', asyncRoute(async (req, res) => {
    const actor = await verifyCredentials(pool, req.body?.username, req.body?.password);
    if (!actor) {
      throw new HttpError(401, 'Usuario o contraseña incorrectos.');
    }
    req.session.actorId = actor.id;
    res.json({ user: toPublicUser(actor) });
  }));

  app.get('/auth/me', asyncRoute(async (req, res) => {
    if (!req.session?.actorId) {
      throw new HttpError(401, 'No hay una sesión activa.');
    }
    const actor = await requireSession(pool, req);
    res.json({ user: toPublicUser(actor) });
  }));

  app.post('/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.status(204).end();
    });
  });

  app.get('/activities', asyncRoute(async (_req, res) => {
    const rows = await listActivities(pool);
    res.json({ activities: rows.map(toActivity) });
  }));

  app.get('/activities/:id', asyncRoute(async (req, res) => {
    if (!ACTIVITY_ID.test(req.params.id)) {
      throw new HttpError(400, 'El identificador de la actividad no es válido.');
    }
    const activity = await findActivity(pool, req.params.id);
    if (!activity) throw new HttpError(404, 'No encontramos esa actividad.');
    const actor = await requireSession(pool, req);
    const visible = await listVisibleRegistrations(pool, actor);
    const roster = visible
      .filter((row) => row.activity_id === activity.id)
      .map(toRegistrationListItem);
    res.json({ activity: toActivity(activity), roster });
  }));

  app.get('/registrations', asyncRoute(async (req, res) => {
    const actor = await requireSession(pool, req);
    const rows = await listVisibleRegistrations(pool, actor);
    res.json({ registrations: rows.map(toRegistrationListItem) });
  }));

  app.get('/registrations/:id', asyncRoute(async (req, res) => {
    const actor = await requireSession(pool, req);
    if (!REGISTRATION_ID.test(req.params.id)) {
      throw new HttpError(400, 'El identificador de la inscripción no es válido.');
    }
    const result = await readRegistration({
      pool,
      actor,
      registrationId: req.params.id
    });
    res.status(result.status).json(result.body);
  }));

  app.post('/registrations', asyncRoute(async (req, res) => {
    const actor = await requireSession(pool, req);
    if (actor.role !== 'student') {
      throw new HttpError(403, 'Solo un estudiante puede inscribirse en una actividad.');
    }
    const activityId = typeof req.body?.activityId === 'string' ? req.body.activityId.trim() : '';
    if (!ACTIVITY_ID.test(activityId)) {
      throw new HttpError(400, 'Elige una actividad válida.');
    }
    const created = await createRegistration(pool, { activityId, studentId: actor.id });
    if (created.error === 'missing') throw new HttpError(404, 'No encontramos esa actividad.');
    if (created.error === 'full') throw new HttpError(409, 'Esta actividad ya no tiene cupos.');
    if (created.error === 'duplicate') throw new HttpError(409, 'Ya tienes una inscripción en esta actividad.');

    const deskVerificationCode = createConfirmationToken();
    await sendMail({
      to: actor.email,
      subject: `Inscripción confirmada · ${created.registration.activity_title}`,
      text: `${actor.display_name}, tu cupo quedó registrado en «${created.registration.activity_title}». Código de verificación en mesa: ${deskVerificationCode}. Este mensaje es ficticio y permanece en el correo simulado del laboratorio.`,
      correlationId: req.correlationId,
      registrationId: created.registration.id
    });
    logConfirmation({
      email: actor.email,
      registrationId: created.registration.id,
      correlationId: req.correlationId,
      deskVerificationCode
    });
    res.status(201).json({
      registration: toRegistrationDetail(created.registration),
      deskVerificationCode
    });
  }));

  app.get('/messages', asyncRoute(async (req, res) => {
    const actor = await requireSession(pool, req);
    const mailbox = await listMail();
    const visibleIds = await visibleRegistrationIds(pool, actor);
    res.json({
      notice: mailbox.notice,
      messages: filterMessages(actor, mailbox.messages, visibleIds)
    });
  }));

  app.use((_req, res) => {
    res.status(404).json({ error: 'No encontramos ese recurso.' });
  });

  app.use((err, req, res, _next) => {
    if (err instanceof SyntaxError && err.status === 400) {
      return res.status(400).json({
        error: 'El cuerpo de la solicitud no es JSON válido.',
        correlationId: req.correlationId
      });
    }
    const status = err instanceof HttpError ? err.status : 500;
    if (status >= 500) {
      console.log(JSON.stringify({
        level: 'error',
        event: 'request.failed',
        correlationId: req.correlationId
      }));
    }
    res.status(status).json({
      error: status >= 500 ? 'No pudimos completar la operación. Inténtalo otra vez.' : err.message,
      correlationId: req.correlationId
    });
  });

  return app;
}
