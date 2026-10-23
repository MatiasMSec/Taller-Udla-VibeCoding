# Registro de escaneos (plantilla)

Registra solo salidas **reales** de tu equipo. Si un comando no encontró hallazgos, anótalo. No copies ejemplos SIMULADOS como si fueran tuyos.

| Fecha | Herramienta | Comando | Versión | Resultado (resumen) | Archivo de salida |
| --- | --- | --- | --- | --- | --- |
| 2026-10-22 | Nuclei | `nuclei -u http://127.0.0.1:8080 …` | (local) | 0 hallazgos medium+ | `scan-output-nuclei-8080.txt` |
| 2026-10-22 | Nuclei | `nuclei -u :3000 -u :8025 …` | (local) | 0 hallazgos medium+ | `scan-output-nuclei-api-mail.txt` |
| 2026-10-22 | Trivy | `trivy image --severity HIGH,CRITICAL …` | 0.72.0 | 68/56/68 HIGH+CRIT api/web/mail | `scan-output-trivy-images.txt` |
| 2026-10-22 | DAST manual | curl -I, prueba mail :8025 | — | Cabeceras nginx; mail sin auth; crash URL | `scan-output-headers-dast.txt` |
