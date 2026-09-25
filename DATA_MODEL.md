# DATA_MODEL — CRM La Rayuela School

Modelo relacional para Postgres (Supabase). Todas las tablas viven en el esquema `public`.
Las contraseñas de acceso van en `auth.users` de Supabase Auth; `profiles` es la extensión de negocio.

```
auth.users 1──1 profiles
profiles (tutor|parent)
  tutor  1──* classes ──* class_enrollments *──1 students
  parent *──* students (parent_students)
students 1──* payments 1──* payment_receipts
classes  1──* schedule_slots
classes  1──* assignments 1──* assignment_submissions
academic_years 1──* (classes, payments, calendar_events)
profiles 1──* messages / notifications
```

---

## Convenciones

| Convención | Valor |
|---|---|
| PK | `uuid` (`gen_random_uuid()`) |
| Tiempos | `timestamptz` UTC |
| Soft delete | no; se archiva con `status` |
| Periodo lectivo | septiembre → junio (`academic_years.start_date` / `end_date`) |
| Roles | `tutor`, `parent` (enum `user_role`) |
| Storage buckets | `avatars`, `assignments`, `submissions`, `receipts` |

---

## Enums

```sql
user_role            = tutor | parent
relationship_type    = madre | padre | tutor_legal | otro
assignment_status    = publicada | cerrada
submission_status    = pendiente | entregada | revisada | tardia
payment_status       = pendiente | en_revision | pagado | vencido | rechazado
receipt_status       = pendiente | aprobado | rechazado
event_type           = clase | tarea | evento | feriado | pago | reunion
notification_type    = tarea | mensaje | pago | evento | sistema
message_folder       = inbox | sent
weekday              = 1..7  -- 1 = lunes … 7 = domingo
```

---

## Tablas

### 1. `profiles`

Extiende `auth.users`. Un usuario = un rol.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | = `auth.users.id` |
| email | text UNIQUE NOT NULL | |
| full_name | text NOT NULL | |
| role | user_role NOT NULL | |
| phone | text | |
| avatar_url | text | bucket `avatars` |
| subject | text | solo tutores (materia principal) |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | |

**RLS:** el usuario lee su perfil; tutores leen perfiles de padres de sus alumnos; padres leen tutores de las clases de sus hijos.

---

### 2. `academic_years`

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | ej. `2026-2027` |
| start_date | date NOT NULL | 1 de septiembre |
| end_date | date NOT NULL | 30 de junio |
| is_active | boolean | un solo año activo |

---

### 3. `students`

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| first_name | text NOT NULL | |
| last_name | text NOT NULL | |
| grade | text NOT NULL | ej. `3° Primaria` |
| section | text | ej. `A` |
| photo_url | text | |
| academic_year_id | uuid FK → academic_years | |
| birth_date | date | |
| created_at | timestamptz | |

---

### 4. `parent_students`

Relación N:N padre ↔ alumno.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| parent_id | uuid FK → profiles | `role = parent` |
| student_id | uuid FK → students | |
| relationship | relationship_type | |
| UNIQUE(parent_id, student_id) | | |

---

### 5. `classes`

Materia / grupo impartido por un tutor.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | ej. `Matemáticas 3A` |
| subject | text NOT NULL | |
| grade | text | |
| section | text | |
| room | text | aula |
| color | text | hex para UI |
| tutor_id | uuid FK → profiles | `role = tutor` |
| academic_year_id | uuid FK → academic_years | |
| created_at | timestamptz | |

---

### 6. `class_enrollments`

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| class_id | uuid FK → classes | |
| student_id | uuid FK → students | |
| UNIQUE(class_id, student_id) | | |

---

### 7. `schedule_slots`

Horario semanal de cada clase.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| class_id | uuid FK → classes | ON DELETE CASCADE |
| weekday | smallint NOT NULL | 1 lunes … 7 domingo |
| start_time | time NOT NULL | |
| end_time | time NOT NULL | |
| room | text | override de aula |

---

### 8. `assignments` (tareas)

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| class_id | uuid FK → classes | |
| tutor_id | uuid FK → profiles | |
| title | text NOT NULL | |
| description | text | |
| due_date | timestamptz NOT NULL | |
| attachment_url | text | material del tutor (bucket `assignments`) |
| attachment_name | text | |
| status | assignment_status | default `publicada` |
| created_at | timestamptz | |

---

### 9. `assignment_submissions`

Entrega del alumno (la sube el padre).

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| assignment_id | uuid FK → assignments | |
| student_id | uuid FK → students | |
| uploaded_by | uuid FK → profiles | padre |
| file_url | text NOT NULL | bucket `submissions` |
| file_name | text | |
| notes | text | |
| status | submission_status | |
| tutor_feedback | text | |
| submitted_at | timestamptz | |
| UNIQUE(assignment_id, student_id) | | una entrega vigente por tarea |

---

### 10. `calendar_events`

Eventos del mes (íconos del calendario).

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| title | text NOT NULL | |
| description | text | |
| event_date | date NOT NULL | |
| event_type | event_type NOT NULL | |
| class_id | uuid FK → classes | nullable |
| student_id | uuid FK → students | nullable = visible para el grupo |
| academic_year_id | uuid FK → academic_years | |
| created_by | uuid FK → profiles | |

Los padres ven: eventos de las clases de sus hijos + eventos globales del año + tareas con `due_date` ese día.
Los tutores ven: eventos de sus clases + globales.

---

### 11. `messages` (correo interno)

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| sender_id | uuid FK → profiles | |
| subject | text NOT NULL | |
| body | text NOT NULL | |
| parent_id | uuid FK → messages | hilo (nullable) |
| created_at | timestamptz | |

Padres pueden escribir a tutores de las clases de sus hijos.
Tutores pueden escribir a padres de sus alumnos.

---

### 12. `message_recipients`

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| message_id | uuid FK → messages | ON DELETE CASCADE |
| recipient_id | uuid FK → profiles | |
| read_at | timestamptz | null = no leído |
| UNIQUE(message_id, recipient_id) | | |

Bandeja:
- **Recibidos** → filas donde `recipient_id = me`
- **Enviados** → `messages.sender_id = me`

---

### 13. `notifications`

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → profiles | |
| title | text NOT NULL | |
| body | text | |
| type | notification_type | |
| link | text | ruta interna ej. `/tareas/…` |
| read_at | timestamptz | |
| created_at | timestamptz | |

Se generan al: publicar tarea, entregar tarea, recibir correo, subir comprobante, aprobar/rechazar pago.

---

### 14. `payments`

Una fila por alumno × mes del periodo lectivo (sep–jun = 10 cuotas).

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| student_id | uuid FK → students | |
| academic_year_id | uuid FK → academic_years | |
| month | smallint NOT NULL | 9..12 y 1..6 |
| year | smallint NOT NULL | año calendario de esa cuota |
| concept | text | default `Colegiatura` |
| amount | numeric(10,2) NOT NULL | |
| due_date | date NOT NULL | |
| status | payment_status | |
| UNIQUE(student_id, academic_year_id, month, year) | | |

---

### 15. `payment_receipts`

Comprobantes subidos por el padre.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| payment_id | uuid FK → payments | |
| uploaded_by | uuid FK → profiles | |
| file_url | text NOT NULL | bucket `receipts` |
| file_name | text | |
| notes | text | |
| status | receipt_status | default `pendiente` |
| reviewed_by | uuid FK → profiles | tutor |
| review_notes | text | |
| uploaded_at | timestamptz | |
| reviewed_at | timestamptz | |

---

## Galería

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| tutor_id | uuid FK → profiles | profesor que sube |
| caption | text | |
| image_url | text | bucket `gallery` |
| created_at | timestamptz | se muestra fecha y hora |

Padres y tutores leen; solo tutores y `admin` insertan.

## Salud del alumno (`students`)

Campos extra que el **padre puede editar**: `allergies`, `disability`, `special_notes`, `blood_type`, `emergency_contact`.

## Admin

El perfil `admin@rayuela.edu` (`role = admin`) registra padres, tutores y alumnos. Al crear un usuario se genera contraseña temporal y un token en `password_resets`; se envía correo con el enlace `#/cambiar-contrasena?token=…`.


| Bucket | Quién sube | Quién lee |
|---|---|---|
| `avatars` | el propio usuario | autenticados |
| `assignments` | tutor de la clase | padres de alumnos inscritos + tutor |
| `submissions` | padre del alumno | ese padre + tutor de la clase |
| `receipts` | padre del alumno | ese padre + tutores |

Ruta sugerida: `{bucket}/{user_id}/{uuid}-{filename}`.

---

## Políticas RLS (resumen)

1. **profiles** — `id = auth.uid()`; lecturas cruzadas solo de contactos académicos.
2. **students** — padre si existe `parent_students`; tutor si el alumno está en sus `classes`.
3. **classes / schedule_slots / assignments** — tutor dueño; padre con hijo inscrito.
4. **assignment_submissions** — padre del `student_id` insert/select; tutor de la clase select/update (feedback).
5. **messages / recipients** — sender o recipient.
6. **notifications** — solo `user_id = auth.uid()`.
7. **payments / receipts** — padre del alumno; tutores de sus clases pueden revisar.

El backend Node (`service_role`) aplica las mismas reglas a nivel de aplicación cuando se usa la API Express.

---

## Flujos clave

### Tarea
1. Tutor crea `assignments` → notificación a cada padre del grupo.
2. Padre sube archivo → `assignment_submissions`.
3. Tutor deja `tutor_feedback` y marca `revisada`.

### Correo
1. Padre elige tutor(es) de las clases del hijo → `messages` + `message_recipients`.
2. Tutor responde (nuevo mensaje con `parent_id`).
3. Destinatario recibe `notifications` tipo `mensaje`.

### Pagos del periodo (sep–jun)
1. Al matricular se generan 10 `payments` (sep, oct, nov, dic, ene, feb, mar, abr, may, jun).
2. Padre sube comprobante del mes → `payment_receipts`, status `en_revision`.
3. Tutor aprueba o rechaza → `pagado` / `rechazado` + notificación.

### Calendario
Unión de: `calendar_events` del mes + `assignments.due_date` + `payments.due_date` + `schedule_slots` del día.
Íconos: documento (tarea), lista (evento), carpeta (clase/material), comprobante (pago).
