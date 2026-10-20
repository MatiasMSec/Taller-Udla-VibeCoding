import { useEffect, useState } from 'react';

const PLANES = [
  {
    id: 'datos',
    title: 'Plano de datos',
    boxes: [
      { id: 'usuario', label: 'Estudiante', detail: 'Navegador' },
      { id: 'front', label: 'Interfaz', detail: 'React' },
      { id: 'api', label: 'API', detail: 'Node.js' },
      { id: 'datos', label: 'Datos', detail: 'PostgreSQL' },
      { id: 'correo', label: 'Correo', detail: 'Simulado local' }
    ]
  },
  {
    id: 'entrega',
    title: 'Plano de entrega',
    boxes: [
      { id: 'repo', label: 'Repositorio', detail: 'Cambio' },
      { id: 'revision', label: 'Revisión', detail: 'Persona' },
      { id: 'ci', label: 'CI', detail: 'Controles' },
      { id: 'registry', label: 'Registro', detail: 'Artefacto' },
      { id: 'ops', label: 'Operación', detail: 'Publicar y revertir' }
    ]
  }
];

const STORAGE_KEY = 'campusflow-diagrama-v1';

function emptyState() {
  return { notes: {}, boundaries: [] };
}

export function DiagramPage({ go }) {
  const [state, setState] = useState(emptyState);
  const [selected, setSelected] = useState('api');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      setState({ ...emptyState(), ...JSON.parse(saved) });
    } catch {
      setState(emptyState());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const current = PLANES.flatMap((plane) => plane.boxes).find((box) => box.id === selected);

  function updateNote(value) {
    setState((prev) => ({ ...prev, notes: { ...prev.notes, [selected]: value } }));
  }

  function toggleBoundary() {
    setState((prev) => {
      const has = prev.boundaries.includes(selected);
      return {
        ...prev,
        boundaries: has ? prev.boundaries.filter((id) => id !== selected) : [...prev.boundaries, selected]
      };
    });
  }

  async function copySummary() {
    const lines = ['Mapa de CampusFlow'];
    for (const plane of PLANES) {
      lines.push('', plane.title);
      for (const box of plane.boxes) {
        const boundary = state.boundaries.includes(box.id) ? ' [límite de confianza]' : '';
        const note = state.notes[box.id]?.trim();
        lines.push(`- ${box.label} (${box.detail})${boundary}${note ? `: ${note}` : ''}`);
      }
    }
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
  }

  return (
    <>
      <button className="text-link" type="button" onClick={() => go('/expediente')}>Volver al expediente</button>
      <p className="kicker">Laboratorio A</p>
      <h1>Diagrama editable</h1>
      <p className="lede">Marca límites de confianza y escribe una pregunta verificable en cada componente. Las notas quedan en este navegador.</p>
      <div className="planes">
        {PLANES.map((plane) => (
          <section key={plane.id}>
            <h2>{plane.title}</h2>
            <div className="flow">
              {plane.boxes.map((box) => (
                <button
                  key={box.id}
                  type="button"
                  className={`flow-box ${selected === box.id ? 'is-selected' : ''} ${state.boundaries.includes(box.id) ? 'is-boundary' : ''}`}
                  onClick={() => setSelected(box.id)}
                >
                  <strong>{box.label}</strong>
                  <span>{box.detail}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      {current && (
        <section className="panel editor">
          <h2>{current.label}</h2>
          <label className="check">
            <input
              type="checkbox"
              checked={state.boundaries.includes(current.id)}
              onChange={toggleBoundary}
            />
            Marcar como límite de confianza
          </label>
          <label htmlFor="nota">Supuesto o pregunta verificable</label>
          <textarea
            id="nota"
            value={state.notes[current.id] || ''}
            onChange={(event) => updateNote(event.target.value)}
            placeholder="¿Qué habría que observar para confiar en este salto?"
          />
          <button className="button" type="button" onClick={copySummary}>
            {copied ? 'Resumen copiado' : 'Copiar resumen'}
          </button>
        </section>
      )}
    </>
  );
}
