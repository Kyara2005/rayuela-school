-- Seed de referencia para Supabase.
-- 1) Ejecuta schema.sql
-- 2) Crea usuarios en Authentication > Users (o Auth Admin API) con el mismo correo
--    y user_metadata: { "full_name": "...", "role": "parent" | "tutor" }
-- 3) El trigger handle_new_user creará el profile.
-- 4) Inserta año, alumnos, clases y llama generate_tuition_plan.

-- Ejemplo de año lectivo (septiembre → junio):
insert into public.academic_years (name, start_date, end_date, is_active)
values ('2026-2027', '2026-09-01', '2027-06-30', true)
on conflict do nothing;

-- Después de crear el alumno:
-- select public.generate_tuition_plan('<student_uuid>', '<year_uuid>', 2500);

-- El dataset completo de demostración (Kyara, Eduardo, Ana García, etc.)
-- está en server/demoSeed.js y se carga solo en modo local.
