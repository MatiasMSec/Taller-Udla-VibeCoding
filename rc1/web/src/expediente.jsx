import { useEffect, useState } from 'react';
import { Markdown } from './markdown.jsx';

function Message({ children }) {
  return <p className="message is-error" role="alert">{children}</p>;
}

export function ExpedientePage({ go }) {
  const [index, setIndex] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/expediente/indice.json')
      .then((response) => {
        if (!response.ok) throw new Error('No encontramos el índice del expediente.');
        return response.json();
      })
      .then(setIndex)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <p className="kicker">Taller</p>
      <h1>Expediente del proveedor</h1>
      <p className="lede">Abre cada pieza y distingue una afirmación de una evidencia. El expediente no completa la matriz ni el dictamen.</p>
      {error && <Message>{error}</Message>}
      {index?.groups.map((group) => (
        <section className="doc-group" key={group.id}>
          <h2>{group.title}</h2>
          {group.note && <p>{group.note}</p>}
          <ul className="doc-list">
            {group.items.map((item) => (
              <li key={item.id}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </div>
                {item.href ? (
                  <button className="button button-secondary" type="button" onClick={() => go(item.href)}>{item.action || 'Abrir'}</button>
                ) : (
                  <button className="button button-secondary" type="button" onClick={() => go(`/expediente/ver/${item.id}`)}>{item.action || 'Leer'}</button>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

export function DocumentPage({ go, docId }) {
  const [doc, setDoc] = useState(null);
  const [source, setSource] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/expediente/indice.json')
      .then((response) => response.json())
      .then((index) => {
        const found = index.groups.flatMap((group) => group.items).find((item) => item.id === docId);
        if (!found?.file) throw new Error('Ese documento no está en el expediente del alumnado.');
        if (cancelled) return null;
        setDoc(found);
        return fetch(`/expediente/${found.file}`);
      })
      .then((response) => {
        if (!response) return null;
        if (!response.ok) throw new Error('No pudimos abrir ese archivo.');
        return response.text();
      })
      .then((text) => {
        if (text != null && !cancelled) setSource(text);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [docId]);

  return (
    <>
      <button className="text-link" type="button" onClick={() => go('/expediente')}>Volver al expediente</button>
      {doc && <p className="kicker">{doc.kind}</p>}
      <h1>{doc?.title || 'Documento'}</h1>
      {error && <Message>{error}</Message>}
      {!error && !source && <p className="loading">Abriendo el documento…</p>}
      {source && <article className="paper"><Markdown source={source} /></article>}
    </>
  );
}
