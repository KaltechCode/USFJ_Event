-- Read-only verification after the migration.
SELECT
  c.relname,
  c.relrowsecurity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'request_limits',
    'volunteers',
    'guest_registrations',
    'sponsors'
  );

-- Every browser-role result below must be false.
SELECT
  role_name,
  table_name,
  has_table_privilege(role_name, table_name, 'SELECT') AS can_select,
  has_table_privilege(role_name, table_name, 'INSERT') AS can_insert
FROM (VALUES ('anon'), ('authenticated')) roles (role_name)
CROSS JOIN (
  VALUES
    ('public.request_limits'),
    ('public.volunteers'),
    ('public.guest_registrations'),
    ('public.sponsors')
) tables (table_name);

SELECT
  has_function_privilege(
    'anon',
    'public.consume_rate_limit(text,integer,integer)',
    'EXECUTE'
  ) AS anon_can_execute,
  has_function_privilege(
    'authenticated',
    'public.consume_rate_limit(text,integer,integer)',
    'EXECUTE'
  ) AS authenticated_can_execute;
