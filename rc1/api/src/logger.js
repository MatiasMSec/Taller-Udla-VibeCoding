import fs from 'node:fs';

export function logConfirmation({ email, registrationId, correlationId, deskVerificationCode }) {
  const line = `INFO registration.confirmed email=${email} registrationId=${registrationId} correlationId=${correlationId} deskVerificationCode=${deskVerificationCode ?? 'n/a'}`;
  console.log(line);
  if (process.env.LOG_PATH) {
    fs.appendFileSync(process.env.LOG_PATH, `${line}\n`);
  }
}
