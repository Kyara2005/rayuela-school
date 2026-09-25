# La Rayuela School — CRM educativo

Portal para **tutores** y **padres de familia**: calendario, tareas con archivos, correo interno, notificaciones, horario con nombre del profesor y seguimiento de colegiaturas (septiembre–junio).

Stack: **JavaScript + Node.js (Express)** en el servidor, frontend estático, **Supabase** (Postgres + Auth + Storage) como base de datos de producción. En local arranca en **modo demo** sin cuenta de Supabase.

El diseño sigue los colores del logo (verde, azul, naranja, dorado) y la estructura de las pantallas de referencia (barra superior, menú académico y calendario mensual).

---

## Cómo arrancar (demo local)

```bash
cd rayuela
copy .env.example .env   # en macOS/Linux: cp .env.example .env
npm install
npm start
```

Abre [http://localhost:3000](http://localhost:3000)

| Rol | Correo | Contraseña |
|---|---|---|
| Admin | `admin@rayuela.edu` | `admin123` |
| Padre (Eduardo Altamirano, hija Kyara) | `padre@rayuela.edu` | `padre123` |
| Tutora (Ana García, Matemáticas) | `tutor@rayuela.edu` | `tutor123` |

Los datos viven en `data/store.json`. Los archivos subidos van a `data/uploads/`. Borra `data/store.json` y reinicia para volver al seed.

---

## Qué incluye cada rol

### Padres de familia
- Panel con resumen, correos y pagos
- Calendario mensual (tareas, eventos, feriados, colegiaturas)
- Tareas: ver lo que mandó el profesor y **subir archivo**
- Correo: recibir avisos y **escribir a los profesores** del hijo
- Notificaciones
- Pagos del periodo lectivo **septiembre–junio**: una tarjeta por mes para subir comprobante
- Horario de clases con **nombre del profesor** y aula
- Ficha del estudiante y listado de clases

### Tutores
- Publicar tareas (con archivo opcional) y revisar entregas
- Correo hacia los padres de sus alumnos
- Calendario y horario de sus materias
- Validar o rechazar comprobantes de colegiatura

---

## Modelo de datos

Lee **[DATA_MODEL.md](./DATA_MODEL.md)** para tablas, relaciones, enums, buckets de Storage y políticas RLS.

SQL listo para pegar en Supabase:

- `supabase/schema.sql` — tablas, índices, RLS, buckets
- `supabase/seed.sql` — cómo cargar el ciclo de prueba

Cuando `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` estén en `.env`, el esquema ya está preparado. El servidor actual usa el almacén demo para que puedas trabajar de inmediato; el siguiente paso de integración es sustituir `server/store.js` por consultas al cliente de `@supabase/supabase-js` (ya está en dependencias).

---

## API

Todas las rutas (salvo login) llevan `Authorization: Bearer <token>` o cookie `token`.

| Método | Ruta | Uso |
|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` |
| GET | `/api/me` | Usuario, ciclo, alumnos |
| GET | `/api/dashboard` | Resumen |
| GET | `/api/calendar?year&month` | Eventos del mes |
| GET/POST | `/api/assignments` | Listar / crear tarea |
| POST | `/api/assignments/:id/submit` | Entrega (multipart `file`) |
| GET/POST | `/api/messages` | Correo |
| GET | `/api/notifications` | Avisos |
| GET | `/api/payments` | Colegiaturas sep–jun |
| POST | `/api/payments/:id/receipt` | Comprobante |
| GET | `/api/schedule` | Horario |

---

## Periodo lectivo

El ciclo demo es **2026-2027**: 1 de septiembre 2026 → 30 de junio 2027.  
Hay **10 colegiaturas** (sep, oct, nov, dic, ene, feb, mar, abr, may, jun). En el seed, septiembre de Kyara ya está pagado y octubre está en revisión.
