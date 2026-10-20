/**
 * Código de verificación en mesa de información (RC-1).
 * El estudiante lo muestra para retirar material impreso de la actividad.
 */
export function createConfirmationToken() {
  const part = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0');
  return `CF-${part}`;
}
