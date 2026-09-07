-- Datos estructurales del MVP. No crea usuarios ni leads demo.
-- Es idempotente y conserva cualquier clínica adicional creada después.

insert into public.clinics (name, city, slug, color, active)
values
  ('Clínica Dental Vitalis Madrid', 'Madrid', 'madrid', '#2563EB', true),
  ('Clínica Dental Vitalis Valencia', 'Valencia', 'valencia', '#059669', true),
  ('Clínica Dental Vitalis Sevilla', 'Sevilla', 'sevilla', '#D97706', true)
on conflict (slug) do update
set name = excluded.name,
    city = excluded.city,
    color = excluded.color,
    active = excluded.active;
