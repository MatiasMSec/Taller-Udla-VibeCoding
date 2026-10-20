import http from 'node:http';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const seed = JSON.parse(readFileSync(new URL('./seed.json', import.meta.url), 'utf8'));
let messages = seed.map((message) => ({ ...message }));

function send(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(data);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://mail.local');

  if (req.method === 'GET' && url.pathname === '/health') {
    return send(res, 200, { status: 'ok', service: 'campusflow-mail', mode: 'simulado-local' });
  }

  if (req.method === 'GET' && url.pathname === '/messages') {
    return send(res, 200, {
      messages,
      notice: 'Mensajes ficticios retenidos en este proceso. No se envían a Internet.'
    });
  }

  if (req.method === 'DELETE' && url.pathname === '/messages') {
    messages = seed.map((message) => ({ ...message }));
    return send(res, 200, { restored: messages.length });
  }

  if (req.method === 'POST' && url.pathname === '/messages') {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 20_000) {
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
      } catch {
        return send(res, 400, { error: 'El cuerpo no es JSON válido.' });
      }
      if (typeof body.to !== 'string' || typeof body.subject !== 'string' || typeof body.text !== 'string') {
        return send(res, 400, { error: 'Faltan campos del mensaje.' });
      }
      const message = {
        id: randomUUID(),
        to: body.to,
        subject: body.subject,
        text: body.text,
        correlationId: typeof body.correlationId === 'string' ? body.correlationId : null,
        registrationId: typeof body.registrationId === 'string' ? body.registrationId : null,
        createdAt: new Date().toISOString()
      };
      messages.unshift(message);
      return send(res, 201, { message });
    });
    return;
  }

  return send(res, 404, { error: 'No encontramos ese recurso.' });
});

server.listen(8025, '0.0.0.0');
