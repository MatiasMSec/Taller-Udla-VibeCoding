import { findRegistration } from './db.js';
import { toRegistrationDetail } from './present.js';

/** RC-1: requiere sesión en la ruta; autorización por objeto incompleta en esta entrega. */
export async function readRegistration({ pool, actor, registrationId }) {
  const registration = await findRegistration(pool, registrationId);
  if (!registration) {
    return { status: 404, body: { error: 'No encontramos esa inscripción.' } };
  }
  return { status: 200, body: { registration: toRegistrationDetail(registration) } };
}
