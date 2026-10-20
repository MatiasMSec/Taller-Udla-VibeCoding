import bcrypt from 'bcryptjs';
import session from 'express-session';
import { getActor, findActorForLogin } from './db.js';
import { HttpError } from './errors.js';

const ROLE_LABELS = {
  student: 'Estudiante',
  coordinator: 'Coordinadora'
};

export function toPublicUser(actor) {
  if (!actor) return null;
  return {
    id: actor.id,
    displayName: actor.display_name,
    email: actor.email,
    role: actor.role,
    roleLabel: ROLE_LABELS[actor.role] || actor.role
  };
}

export function sessionMiddleware(secret) {
  if (!secret || secret.length < 16) {
    throw new Error('SESSION_SECRET debe tener al menos 16 caracteres.');
  }
  return session({
    name: 'campusflow.sid',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 4 * 60 * 60 * 1000
    }
  });
}

export async function verifyCredentials(pool, username, password) {
  const login = typeof username === 'string' ? username.trim().toLowerCase() : '';
  const pass = typeof password === 'string' ? password : '';
  if (!login || !pass) return null;
  const row = await findActorForLogin(pool, login);
  if (!row?.password_hash) return null;
  const ok = await bcrypt.compare(pass, row.password_hash);
  if (!ok) return null;
  return getActor(pool, row.id);
}

export async function requireSession(pool, req) {
  const actorId = req.session?.actorId;
  if (!actorId) {
    throw new HttpError(401, 'Inicia sesión para continuar.');
  }
  const actor = await getActor(pool, actorId);
  if (!actor) {
    await new Promise((resolve) => req.session.destroy(() => resolve()));
    throw new HttpError(401, 'Tu sesión ya no es válida.');
  }
  return actor;
}
