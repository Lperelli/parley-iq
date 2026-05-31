# Parley IQ

**Plataforma premium de análisis estadístico de fútbol con IA.**

> Solo análisis estadístico. No es asesoría de apuestas. La probabilidad no es certeza.

---

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Framer Motion** — animaciones premium
- **Zustand** — estado global (parley, guardados)
- **Groq AI** — análisis IA con Llama
- **API-Football** — datos reales (o mock sin clave)

---

## Arrancar local

```bash
cd parley-iq
cp .env.example .env.local
# edita .env.local con tus claves (opcional para mock)
npm run dev
```

Abre `http://localhost:3000`. Sin claves, corre en modo mock (datos de ejemplo).

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `FOOTBALL_API_KEY` | Clave API-Football (api-sports.io) — opcional |
| `GROQ_API_KEY` | Clave Groq AI — necesaria para análisis IA |
| `GROQ_MODEL` | Modelo (default: llama-3.3-70b-versatile) |

---

## Pantallas

| Ruta | Descripción |
|---|---|
| `/` | Home / Dashboard con tabs por fecha |
| `/partidos` | Lista de fixtures con filtros |
| `/partidos/[id]` | Detalle: Visión, Stats, Forma, H2H, Cuotas, Análisis IA, Parley |
| `/parley` | Constructor de parley con calculadora de riesgo |
| `/guardados` | Análisis y parleys guardados localmente |
| `/configuracion` | Configuración, datos, juego responsable |

---

## Aviso de responsabilidad

Parley IQ es una herramienta de análisis estadístico deportivo.
No es una plataforma de apuestas ni ofrece asesoría financiera.
Ninguna predicción es garantizada.
