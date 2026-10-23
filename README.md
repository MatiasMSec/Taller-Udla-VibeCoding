# CampusFlow · laboratorio estudiantil (RC-1)

Aplicación ficticia de inscripciones. Solo funciona en **127.0.0.1**. Los correos usan `@campus.test`.

## Arranque

```bash
cp .env.example .env   # si no existe
docker compose -f docker-compose.student.yml up -d --build
```

Abre `http://127.0.0.1:8080`. Las **cuentas de demostración** las entrega el docente en el taller (no reutilizar fuera de este laboratorio).

## Reset de datos

```bash
docker compose -f docker-compose.student.yml exec -T db psql -U campusflow -d campusflow -v ON_ERROR_STOP=1 < db/reset.sql
curl -fsS -X DELETE http://127.0.0.1:8025/messages
```

## Detener

```bash
docker compose -f docker-compose.student.yml down
```

## Auditoría con agente (DevSecOps)

Skill obligatoria para agentes: [Cloudflare security-audit-skill](https://github.com/cloudflare/security-audit-skill) (instalada en `.agents/skills/security-audit/`). Proceso: `docs/seguridad/07-auditoria-agente-security-audit.md`.

Reinstalar o actualizar:

```bash
npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit
```

## Herramientas orientativas

Ejecuta y guarda **tus** salidas en `plantillas/registro-escaneos.md`:

- Dependencias: `npm audit` dentro de `api/` y `web/`
- Componentes (contenedor): `trivy image` sobre las imágenes locales, si está instalado
- Secretos en repo: `gitleaks detect --source .`
- Política organizacional (Semgrep), desde la **raíz del paquete extraído** (no dentro del monorepo docente sin copiar):  
  `semgrep --config politicas-semgrep/log-minimizacion-email.yaml rc1/api/src`
- Reglas generales (comparación): `semgrep --config auto rc1/api/src`
- Secretos (política del taller, como Semgrep): `gitleaks detect --source . --config .gitleaks.toml --no-git -v`
- Reglas por defecto (comparación): `gitleaks detect --source . --no-git` (puede no alertar; documentar el contraste)

Si una herramienta no está instalada o no reporta hallazgos, regístralo tal cual.

## Plantillas

Completa los archivos en `plantillas/`. Este paquete **no** incluye respuestas, RC-2 ni evidencia docente.
