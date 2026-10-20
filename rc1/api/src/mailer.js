import { HttpError } from './errors.js';

export async function sendMail(message) {
  const mailUrl = process.env.MAIL_URL;
  if (!mailUrl) {
    throw new HttpError(500, 'No pudimos completar la operación. Inténtalo otra vez.');
  }
  let response;
  try {
    response = await fetch(`${mailUrl}/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(message)
    });
  } catch {
    throw new HttpError(502, 'El correo simulado no está disponible.');
  }
  if (!response.ok) {
    throw new HttpError(502, 'El correo simulado no aceptó la confirmación.');
  }
  return response.json();
}

export async function listMail() {
  const mailUrl = process.env.MAIL_URL;
  if (!mailUrl) {
    throw new HttpError(500, 'No pudimos completar la operación. Inténtalo otra vez.');
  }
  let response;
  try {
    response = await fetch(`${mailUrl}/messages`);
  } catch {
    throw new HttpError(502, 'El correo simulado no está disponible.');
  }
  if (!response.ok) {
    throw new HttpError(502, 'El correo simulado no está disponible.');
  }
  return response.json();
}
