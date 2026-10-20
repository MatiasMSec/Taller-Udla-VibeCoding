export async function api(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: {
        'content-type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error('No pudimos contactar a CampusFlow. Revisa que la versión del laboratorio esté iniciada.');
  }

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }
  }
  if (!response.ok) {
    const error = new Error(data.error || 'No pudimos completar la operación.');
    error.status = response.status;
    throw error;
  }
  return data;
}

export function formatWhen(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Santiago'
  }).format(date);
  const time = new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'America/Santiago'
  }).format(date);
  return `${day}, ${time}`;
}

export function seatsLeft(activity) {
  return Math.max(0, activity.capacity - activity.taken);
}
