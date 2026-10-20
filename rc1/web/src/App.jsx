import { useEffect, useState } from 'react';
import { api } from './api.js';
import { RELEASE_FALLBACK } from './release.js';
import { AuthProvider, LoginPage, useAuth } from './auth.jsx';
import { ActivitiesPage, ActivityPage, RegistrationsPage, DetailPage, MailPage } from './pages.jsx';
import { ExpedientePage, DocumentPage } from './expediente.jsx';
import { DiagramPage } from './diagram.jsx';

const SHOW_EXPEDIENTE = import.meta.env.VITE_CAMPUSFLOW_UI !== 'student';

function useRoute() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  function go(href) {
    window.history.pushState({}, '', href);
    setPath(href);
    window.scrollTo(0, 0);
  }
  return { path, go };
}

function AppShell() {
  const { path, go } = useRoute();
  const { user, loading, logout } = useAuth();
  const [release, setRelease] = useState(RELEASE_FALLBACK);

  useEffect(() => {
    api('/meta')
      .then((meta) => setRelease(meta.release || RELEASE_FALLBACK))
      .catch(() => setRelease(RELEASE_FALLBACK));
  }, []);

  if (loading) {
    return <p className="loading page">Cargando CampusFlow…</p>;
  }

  if (!user) {
    return (
      <>
        <header className="site-header site-header-min">
          <div className="topbar">
            <div className="brand brand-static">
              <span className="brand-mark" aria-hidden="true" />
              <span>
                <strong>CampusFlow</strong>
                <small>Inscripciones universitarias</small>
              </span>
            </div>
          </div>
        </header>
        <main id="contenido" className="page">
          <LoginPage />
        </main>
      </>
    );
  }

  const releaseClass = release === 'RC-2' ? 'is-rc2' : 'is-rc1';
  const releaseLabel = release === 'RC-2' ? 'RC-2 · entrega corregida' : 'RC-1 · entrega inicial';

  let page = <ActivitiesPage user={user} go={go} />;
  const activity = path.match(/^\/actividades\/(act-[a-z0-9-]{3,48})$/);
  const detail = path.match(/^\/inscripciones\/(reg-[a-z0-9-]{3,48})$/);
  const documentMatch = path.match(/^\/expediente\/ver\/([a-z0-9-]+)$/);

  if (path === '/inscripciones') page = <RegistrationsPage user={user} go={go} />;
  else if (detail) page = <DetailPage go={go} registrationId={detail[1]} />;
  else if (activity) page = <ActivityPage user={user} go={go} activityId={activity[1]} />;
  else if (path === '/correo') page = <MailPage />;
  else if (SHOW_EXPEDIENTE && path === '/expediente') page = <ExpedientePage go={go} />;
  else if (SHOW_EXPEDIENTE && path === '/expediente/diagrama') page = <DiagramPage go={go} />;
  else if (SHOW_EXPEDIENTE && documentMatch) page = <DocumentPage go={go} docId={documentMatch[1]} />;
  else if (path !== '/') page = <ActivitiesPage user={user} go={go} />;

  return (
    <>
      <a className="skip" href="#contenido">Saltar al contenido</a>
      <header className="site-header">
        <div className="topbar">
          <button className="brand" type="button" onClick={() => go('/')}>
            <span className="brand-mark" aria-hidden="true" />
            <span>
              <strong>CampusFlow</strong>
              <small>Inscripciones universitarias</small>
            </span>
          </button>
          <div className="topbar-tools">
            <p className={`release ${releaseClass}`}>{releaseLabel}</p>
            <div className="session-bar">
              <span>
                <strong>{user.displayName}</strong>
                <small>{user.roleLabel}</small>
              </span>
              <button className="button button-secondary button-small" type="button" onClick={() => logout()}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
        <nav className="site-nav" aria-label="Secciones">
          <button type="button" onClick={() => go('/')}>Actividades</button>
          <button type="button" onClick={() => go('/inscripciones')}>
            {user.role === 'coordinator' ? 'Inscripciones a mi cargo' : 'Mis inscripciones'}
          </button>
          <button type="button" onClick={() => go('/correo')}>Confirmaciones</button>
          {SHOW_EXPEDIENTE && (
            <button type="button" className="nav-quiet" onClick={() => go('/expediente')}>
              Expediente del proveedor
            </button>
          )}
        </nav>
      </header>
      <main id="contenido" className="page">
        <p className="who">
          Sesión activa como <strong>{user.displayName}</strong>, {user.roleLabel.toLowerCase()}.
        </p>
        {page}
      </main>
      <footer className="site-footer">
        <p>Caso ficticio de taller. Los correos usan el dominio .test y la bandeja no envía mensajes fuera de este equipo.</p>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
